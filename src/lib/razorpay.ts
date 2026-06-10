declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

export function loadRazorpayCheckoutScript(src: string = "https://checkout.razorpay.com/v1/checkout.js"): Promise<void> {
  return new Promise((resolve, reject) => {
    // If SDK already loaded, resolve.
    if (window.Razorpay) return resolve();

    // If script tag already exists, wait for it.
    const existing = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.Razorpay) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay checkout script")));
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve();
      else reject(new Error("Razorpay SDK loaded but window.Razorpay is missing"));
    };
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });
}

