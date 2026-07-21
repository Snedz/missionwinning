package com.missionwinning.app.billing

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.BillingConnectionState
import com.missionwinning.core.data.BillingOffer
import com.missionwinning.core.data.BillingUiSnapshot
import com.missionwinning.core.data.PremiumPurchaseGateway
import com.missionwinning.core.network.MobileApiClient
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Google Play Billing for Super Bundle (Phase 15).
 * Purchase → server enrollment → AuthRepository.refreshPremium().
 * Never gates free offline logger.
 */
@Singleton
class PlayBillingGateway @Inject constructor(
    @ApplicationContext context: Context,
    private val api: MobileApiClient,
    private val authRepository: AuthRepository,
) : PremiumPurchaseGateway, PurchasesUpdatedListener {

    private val appContext = context.applicationContext
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val _state = MutableStateFlow(BillingUiSnapshot())
    override val state: StateFlow<BillingUiSnapshot> = _state.asStateFlow()

    private var productDetails: List<ProductDetails> = emptyList()

    private val billingClient: BillingClient = BillingClient.newBuilder(appContext)
        .setListener(this)
        .enablePendingPurchases(
            PendingPurchasesParams.newBuilder().enableOneTimeProducts().build(),
        )
        .build()

    override fun start() {
        if (billingClient.isReady) {
            refreshOffers()
            return
        }
        _state.update { it.copy(connection = BillingConnectionState.Connecting) }
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    _state.update {
                        it.copy(connection = BillingConnectionState.Ready, lastError = null)
                    }
                    refreshOffers()
                    queryExistingPurchases()
                } else {
                    _state.update {
                        it.copy(
                            connection = BillingConnectionState.Unavailable(
                                result.debugMessage.ifBlank { "Billing unavailable (${result.responseCode})" },
                            ),
                        )
                    }
                }
            }

            override fun onBillingServiceDisconnected() {
                _state.update {
                    it.copy(connection = BillingConnectionState.Connecting)
                }
            }
        })
    }

    override fun refreshOffers() {
        if (!billingClient.isReady) {
            start()
            return
        }
        val productList = PRODUCT_IDS.map { id ->
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(id)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        }
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()
        billingClient.queryProductDetailsAsync(params) { result, details ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                _state.update {
                    it.copy(
                        lastError = result.debugMessage.ifBlank {
                            "Could not load products (${result.responseCode})"
                        },
                    )
                }
                return@queryProductDetailsAsync
            }
            productDetails = details
            val offers = details.map { d ->
                val price = d.subscriptionOfferDetails
                    ?.firstOrNull()
                    ?.pricingPhases
                    ?.pricingPhaseList
                    ?.firstOrNull()
                    ?.formattedPrice
                    ?: "—"
                BillingOffer(
                    productId = d.productId,
                    title = d.title,
                    priceLabel = price,
                    description = d.description,
                )
            }
            _state.update {
                it.copy(
                    offers = offers,
                    lastError = if (offers.isEmpty()) {
                        "No Super Bundle products in Play Console yet"
                    } else {
                        null
                    },
                )
            }
        }
    }

    override fun launchSubscribe(activity: Activity) {
        if (!billingClient.isReady) {
            _state.update { it.copy(lastError = "Billing not ready — try again") }
            start()
            return
        }
        if (authRepository.accessTokenOrNull().isNullOrBlank()) {
            _state.update {
                it.copy(lastError = "Sign in on Account before subscribing (entitlement is account-linked)")
            }
            return
        }
        val details = productDetails.firstOrNull { it.productId == DEFAULT_PRODUCT }
            ?: productDetails.firstOrNull()
        if (details == null) {
            _state.update {
                it.copy(lastError = "Product not found. Configure $DEFAULT_PRODUCT in Play Console.")
            }
            refreshOffers()
            return
        }
        val offerToken = details.subscriptionOfferDetails?.firstOrNull()?.offerToken
        if (offerToken.isNullOrBlank()) {
            _state.update { it.copy(lastError = "No subscription offer token for ${details.productId}") }
            return
        }
        val productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details)
            .setOfferToken(offerToken)
            .build()
        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productParams))
            .build()
        _state.update { it.copy(purchasing = true, lastError = null, lastMessage = null) }
        val launch = billingClient.launchBillingFlow(activity, flowParams)
        if (launch.responseCode != BillingClient.BillingResponseCode.OK) {
            _state.update {
                it.copy(
                    purchasing = false,
                    lastError = launch.debugMessage.ifBlank { "Launch failed (${launch.responseCode})" },
                )
            }
        }
    }

    override fun clearMessages() {
        _state.update { it.copy(lastMessage = null, lastError = null) }
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        if (result.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            _state.update {
                it.copy(purchasing = false, lastMessage = "Purchase canceled")
            }
            return
        }
        if (result.responseCode != BillingClient.BillingResponseCode.OK || purchases == null) {
            _state.update {
                it.copy(
                    purchasing = false,
                    lastError = result.debugMessage.ifBlank {
                        "Purchase failed (${result.responseCode})"
                    },
                )
            }
            return
        }
        for (purchase in purchases) {
            handlePurchase(purchase)
        }
    }

    private fun queryExistingPurchases() {
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build(),
        ) { result, purchases ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) return@queryPurchasesAsync
            purchases.forEach { handlePurchase(it) }
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) return
        val productId = purchase.products.firstOrNull() ?: DEFAULT_PRODUCT
        scope.launch(Dispatchers.IO) {
            _state.update { it.copy(purchasing = true) }
            // Release applicationId (strip debug suffix for server package allowlist)
            val packageName = appContext.packageName.removeSuffix(".debug")
            val server = api.postPlayPurchase(
                productId = productId,
                purchaseToken = purchase.purchaseToken,
                packageName = packageName.ifBlank { "com.missionwinning.app" },
                orderId = purchase.orderId,
            )
            server.onSuccess { resp ->
                if (resp.ok || resp.premium) {
                    if (!purchase.isAcknowledged) {
                        val ack = AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(purchase.purchaseToken)
                            .build()
                        billingClient.acknowledgePurchase(ack) { }
                    }
                    runCatching { authRepository.refreshPremium() }
                    _state.update {
                        it.copy(
                            purchasing = false,
                            lastMessage = if (resp.duplicate) {
                                "Super Bundle already active"
                            } else {
                                "Super Bundle unlocked · coach depth active"
                            },
                            lastError = null,
                        )
                    }
                } else {
                    _state.update {
                        it.copy(
                            purchasing = false,
                            lastError = resp.error ?: "Server did not grant premium",
                        )
                    }
                }
            }.onFailure { e ->
                _state.update {
                    it.copy(
                        purchasing = false,
                        lastError = e.message ?: "Could not verify purchase with server",
                    )
                }
            }
        }
    }

    companion object {
        const val DEFAULT_PRODUCT = "super_bundle_monthly"
        val PRODUCT_IDS = listOf("super_bundle_monthly", "super_bundle_yearly")
    }
}
