package com.missionwinning.core.data

import android.app.Activity
import kotlinx.coroutines.flow.StateFlow

/**
 * Play Billing gateway (Phase 15). Implemented in :app; injected into Coach.
 * Never gates free offline logger — only Super Bundle coach depth.
 */
data class BillingOffer(
    val productId: String,
    val title: String,
    val priceLabel: String,
    val description: String = "",
)

sealed interface BillingConnectionState {
    data object Idle : BillingConnectionState
    data object Connecting : BillingConnectionState
    data object Ready : BillingConnectionState
    data class Unavailable(val reason: String) : BillingConnectionState
}

data class BillingUiSnapshot(
    val connection: BillingConnectionState = BillingConnectionState.Idle,
    val offers: List<BillingOffer> = emptyList(),
    val purchasing: Boolean = false,
    val lastMessage: String? = null,
    val lastError: String? = null,
)

interface PremiumPurchaseGateway {
    val state: StateFlow<BillingUiSnapshot>
    fun start()
    fun refreshOffers()
    /** Launch Play purchase UI for default Super Bundle subscription. */
    fun launchSubscribe(activity: Activity)
    fun clearMessages()
}

/** Tests / widgets when Billing is not wired. */
class NoOpPremiumPurchaseGateway : PremiumPurchaseGateway {
    private val _state = kotlinx.coroutines.flow.MutableStateFlow(BillingUiSnapshot())
    override val state: StateFlow<BillingUiSnapshot> = _state
    override fun start() = Unit
    override fun refreshOffers() = Unit
    override fun launchSubscribe(activity: Activity) = Unit
    override fun clearMessages() = Unit
}
