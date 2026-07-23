package com.missionwinning.feature.coach

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.BillingOffer
import com.missionwinning.core.data.BillingUiSnapshot
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.PremiumPurchaseGateway
import com.missionwinning.core.model.CoachDepth
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.PlanSessionDto
import dagger.hilt.android.lifecycle.HiltViewModel
import com.missionwinning.core.designsystem.MwFreeBeta
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CoachInsightUi(
    val key: String,
    val title: String,
    val body: String,
    val premiumBadge: Boolean = false,
)

data class SessionWhyUi(
    val sessionId: String,
    val headline: String,
    val detail: String,
    val focusLine: String,
    val moveHints: List<String> = emptyList(),
)

data class CoachUiState(
    val plan: CoachPlanResponseDto? = null,
    val loading: Boolean = true,
    val message: String? = null,
    val signedIn: Boolean = false,
    val premium: Boolean = false,
    val premiumSource: String = "anonymous",
    val insights: List<CoachInsightUi> = emptyList(),
    val sessionWhys: Map<String, SessionWhyUi> = emptyMap(),
    val expandedSessionId: String? = null,
    val billing: BillingUiSnapshot = BillingUiSnapshot(),
)

@HiltViewModel
class CoachViewModel @Inject constructor(
    private val repository: MwRepository,
    private val authRepository: AuthRepository,
    private val billing: PremiumPurchaseGateway,
) : ViewModel() {
    private val _local = MutableStateFlow(CoachUiState())

    val state: StateFlow<CoachUiState> = combine(
        _local,
        authRepository.state,
        billing.state,
    ) { local, auth, bill ->
        val premium = MwFreeBeta.ENABLED || auth.premium
        val premiumSource = when {
            MwFreeBeta.ENABLED -> "free_beta"
            else -> auth.premiumSource
        }
        val enriched = enrich(local.plan, premium)
        local.copy(
            signedIn = auth.signedIn,
            premium = premium,
            premiumSource = premiumSource,
            insights = enriched.first,
            sessionWhys = enriched.second,
            billing = bill,
            message = bill.lastMessage ?: local.message,
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        CoachUiState(),
    )

    init {
        billing.start()
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _local.update { it.copy(loading = true, message = null) }
            val plan = repository.ensureCoachPlan(
                preferNetwork = authRepository.accessTokenOrNull() != null,
            )
            if (authRepository.accessTokenOrNull() != null) {
                runCatching { authRepository.refreshPremium() }
            }
            billing.refreshOffers()
            _local.update {
                it.copy(plan = plan, loading = false)
            }
        }
    }

    fun seedAdaptDemo() {
        viewModelScope.launch {
            val plan = repository.seedAdaptDemo()
            _local.update {
                it.copy(
                    plan = plan,
                    loading = false,
                    message = "Adapt depth seeded (miss + swap + equipment note).",
                )
            }
        }
    }

    fun forceReseed() {
        viewModelScope.launch {
            _local.update { it.copy(loading = true) }
            val plan = repository.forceReseedPlan()
            _local.update {
                it.copy(
                    plan = plan,
                    loading = false,
                    message = "Plan reseeded for ${plan.plan.equipmentProfile}.",
                )
            }
        }
    }

    fun toggleSessionWhy(sessionId: String) {
        _local.update { st ->
            st.copy(
                expandedSessionId = if (st.expandedSessionId == sessionId) null else sessionId,
            )
        }
    }

    /** Play Billing — Super Bundle only. Logger stays free. */
    fun subscribe(activity: Activity) {
        billing.launchSubscribe(activity)
    }

    fun clearBillingMessages() {
        billing.clearMessages()
        _local.update { it.copy(message = null) }
    }

    companion object {
        fun enrich(
            plan: CoachPlanResponseDto?,
            premium: Boolean,
        ): Pair<List<CoachInsightUi>, Map<String, SessionWhyUi>> {
            if (plan == null) return emptyList<CoachInsightUi>() to emptyMap()
            val sessions = plan.plan.sessions
            val cards = CoachDepth.insightCards(
                adaptBeats = plan.adaptBeats.map { it.key to it.defaultMessage },
                hasAdaptSignal = plan.hasAdaptSignal,
                revision = plan.plan.revision,
                equipment = plan.plan.equipmentProfile,
                doneCount = sessions.count { it.status == "done" },
                openCount = sessions.count { it.status == "planned" || it.status == "swapped" },
                missedCount = sessions.count { it.status == "missed" },
                swappedCount = sessions.count { it.status == "swapped" },
                premium = premium,
            ).map {
                CoachInsightUi(
                    key = it.key,
                    title = it.title,
                    body = it.body,
                    premiumBadge = it.premiumOnly,
                )
            }
            val whys = sessions.associate { s ->
                s.id to sessionWhyUi(s, premium)
            }
            return cards to whys
        }

        private fun sessionWhyUi(s: PlanSessionDto, premium: Boolean): SessionWhyUi {
            val whyKeys = s.exercises.map { it.whyKey }.filter { it.isNotBlank() }
            val why = CoachDepth.sessionWhy(
                sessionId = s.id,
                name = s.name,
                kind = s.kind,
                status = s.status,
                focusGroups = s.focusGroups,
                exerciseWhyKeys = whyKeys,
                estMinutes = s.estMinutes,
                premium = premium,
            )
            val hints = if (premium) {
                s.exercises.mapNotNull { ex ->
                    val label = CoachDepth.whyKeyLabel(ex.whyKey) ?: return@mapNotNull null
                    "${ex.exerciseId}: $label"
                }.take(4)
            } else {
                emptyList()
            }
            return SessionWhyUi(
                sessionId = why.sessionId,
                headline = why.headline,
                detail = why.detail,
                focusLine = why.focusLine,
                moveHints = hints,
            )
        }
    }
}
