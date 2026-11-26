
// ============================================
// MEHRAJ STORE
// FLAGSMITH A/B TESTING INTEGRATION
// Toggle Wars 2026
// ============================================

"use strict";

const ENVIRONMENT_KEY = "XdLegwUByoj6jfLtfC5kiW";

const LAYOUT_FLAG = "shopping_layout_test";
const RECOMMENDATION_FLAG = "smart_product_recommendations";

const store = window.MehrajStore;

const status = document.getElementById("experimentStatus");

const CONTROL_LAYOUT = {
    layout: "control",
    title: "Welcome to Mehraj Store",
    button_text: "Shop Now"
};

// ============================================
// CONNECTION STATUS
// ============================================

function setStatus(message) {
    status.textContent = message;
}

// ============================================
// APPLY FLAGSMITH CONFIGURATION
// ============================================

function applyFlags() {

    const sdk = window.flagsmith;

    let configuration = CONTROL_LAYOUT;

    if (sdk.hasFeature(LAYOUT_FLAG)) {

        const rawValue = sdk.getValue(LAYOUT_FLAG);

        try {

            const parsedValue =
                typeof rawValue === "string"
                    ? JSON.parse(rawValue)
                    : rawValue;

            if (
                parsedValue &&
                ["control", "premium"].includes(parsedValue.layout)
            ) {

                configuration = parsedValue;

            } else {

                throw new Error("Invalid layout configuration");

            }

        } catch (error) {

            console.error("Invalid feature value:", error);

            store.applyShoppingLayout(CONTROL_LAYOUT);

            setStatus("Flagsmith: Invalid configuration");

            return false;

        }

    }

    // Apply A/B testing layout

    store.applyShoppingLayout(configuration);

    // Smart recommendations feature

    const recommendationsEnabled =
        sdk.hasFeature(RECOMMENDATION_FLAG);

    store.setRecommendationsEnabled(
        recommendationsEnabled
    );

    if (!sdk.hasFeature(LAYOUT_FLAG)) {

        setStatus("Flagsmith connected | Experiment flag disabled");

        return false;

    }

    setStatus(
        "Flagsmith Connected | " +
        configuration.layout.toUpperCase()
    );

    console.log("Flagsmith configuration:", configuration);

    console.log(
        "Recommendations:",
        recommendationsEnabled
    );

    return true;

}

// ============================================
// INITIALIZE FLAGSMITH
// ============================================

async function initializeFlagsmith() {

    try {

        if (!store) {

            throw new Error("Store application not loaded");

        }

        if (!window.flagsmith) {

            throw new Error("Flagsmith SDK not loaded");

        }

        if (
            !ENVIRONMENT_KEY ||
            ENVIRONMENT_KEY === "PASTE_CLIENT_SIDE_KEY_HERE"
        ) {

            throw new Error("Client-side SDK key missing");

        }

        setStatus("Connecting to Flagsmith...");

        await window.flagsmith.init({

            environmentID: ENVIRONMENT_KEY,

            identity: store.visitorId,

            cacheFlags: false,

            enableAnalytics: true

        });

        const applied = applyFlags();

        if (applied) {

            // Local exposure log

            store.trackEvent("experiment_exposure", {

                experiment: "shopping_layout_test",

                source: "flagsmith"

            });

        }

        console.log("Flagsmith initialized successfully");

    } catch (error) {

        console.error("Flagsmith connection failed:", error);

        if (store) {

            store.applyShoppingLayout(CONTROL_LAYOUT);

            store.setRecommendationsEnabled(false);

        }

        setStatus("Offline Preview | CONTROL");

    }

}

// ============================================
// MANUAL FLAG REFRESH
// ============================================

window.refreshStoreFlags = async function () {

    try {

        await window.flagsmith.getFlags();

        applyFlags();

    } catch (error) {

        console.error("Refresh failed:", error);

    }

};

// ============================================
// START INTEGRATION
// ============================================

initializeFlagsmith();

// ============================================
// END OF FLAGSMITH INTEGRATION
// ============================================
