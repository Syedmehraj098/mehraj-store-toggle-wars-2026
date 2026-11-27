
// ============================================
// MEHRAJ STORE
// FLAGSMITH EXPERIMENT & ANALYTICS
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

let analyticsReady = false;

// CONNECTION STATUS

function setStatus(message) {
    if (status) {
        status.textContent = message;
    }
}

// APPLY FLAG CONFIGURATION

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

    store.applyShoppingLayout(configuration);

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
    console.log("Recommendations:", recommendationsEnabled);

    return true;
}

// SEND BUFFERED EVENTS

async function flushAnalytics() {

    if (!analyticsReady) return;

    try {

        await window.flagsmith.flushEvents();

        console.log("Flagsmith event flush completed");

    } catch (error) {

        console.error("Flagsmith event flush failed:", error);

    }
}

// FORWARD STORE EVENTS TO FLAGSMITH

window.addEventListener("mehraj:analytics", async function (e) {

    if (!analyticsReady) return;

    const event = e.detail;

    if (!event || !event.event) return;

    // Exposure is recorded by getExperimentFlag().
    // Avoid sending a duplicate custom exposure event.

    if (event.event === "experiment_exposure") return;

    try {

        await window.flagsmith.trackEvent(event.event);

        console.log(
            "Flagsmith event queued:",
            event.event
        );

        await flushAnalytics();

    } catch (error) {

        console.error(
            "Flagsmith tracking failed:",
            error
        );

    }
});

// INITIALIZE FLAGSMITH

async function initializeFlagsmith() {

    try {

        if (!store) {
            throw new Error("Store application not loaded");
        }

        if (!window.flagsmith) {
            throw new Error("Flagsmith SDK not loaded");
        }

        setStatus("Connecting to Flagsmith...");

        const sdk = window.flagsmith;

        await sdk.init({

            environmentID: ENVIRONMENT_KEY,

            cacheFlags: false,

            enableAnalytics: true,

            enableEvents: true

        });

        await sdk.identify(store.visitorId);

        const applied = applyFlags();

        analyticsReady =
            typeof sdk.getExperimentFlag === "function" &&
            typeof sdk.trackEvent === "function" &&
            typeof sdk.flushEvents === "function";

        if (!analyticsReady) {

            console.warn(
                "Experiment analytics requires a compatible Flagsmith SDK (12.4.0+)"
            );

        }

        if (applied) {

            if (analyticsReady) {

                try {

                    await sdk.getExperimentFlag(LAYOUT_FLAG);

                    console.log(
                        "Flagsmith experiment exposure evaluated"
                    );

                    await flushAnalytics();

                } catch (error) {

                    console.error(
                        "Experiment exposure failed:",
                        error
                    );

                }
            }

            store.trackEvent("experiment_exposure", {

                experiment: LAYOUT_FLAG,

                source: "flagsmith"

            });

        }

        console.log("Flagsmith initialized successfully");

    } catch (error) {

        analyticsReady = false;

        console.error("Flagsmith connection failed:", error);

        if (store) {

            store.applyShoppingLayout(CONTROL_LAYOUT);

            store.setRecommendationsEnabled(false);

        }

        setStatus("Offline Preview | CONTROL");

    }
}

// MANUAL FLAG REFRESH

window.refreshStoreFlags = async function () {

    try {

        await window.flagsmith.getFlags();

        applyFlags();

    } catch (error) {

        console.error("Refresh failed:", error);

    }

};

// FLUSH EVENTS WHEN PAGE BECOMES HIDDEN

document.addEventListener("visibilitychange", function () {

    if (document.visibilityState === "hidden") {

        flushAnalytics();

    }

});

// START INTEGRATION

initializeFlagsmith();

// END OF FLAGSMITH INTEGRATION
