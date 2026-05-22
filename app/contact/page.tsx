"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/ui/PageShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type FormState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setState("sending");
    setMessage("");

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      setState("error");
      setMessage(
        "Missing Web3Forms access key. Check .env.local and restart the dev server."
      );
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      access_key: accessKey,
      subject: "New message from Pokotoba",
      from_name: "Pokotoba Contact Form",
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
      botcheck: String(formData.get("botcheck") || ""),
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      setState("success");
      setMessage("Message sent. Thank you!");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not send the message."
      );
    }
  }

  return (
    <PageShell className="grid min-h-[calc(100svh-170px)] place-items-center py-6 sm:py-8 lg:py-10">
      <section className="contact-page-in mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 2xl:max-w-7xl 2xl:gap-16">
        <div className="text-center lg:text-left">
          <h1 className="contact-title-in text-5xl font-black leading-tight tracking-wide text-[#173763] drop-shadow-sm sm:text-6xl lg:text-7xl 2xl:text-8xl">
            Contact
            <br />
            Pokotoba
          </h1>

          <p className="contact-text-in mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-2xl lg:mx-0 2xl:max-w-2xl 2xl:text-3xl">
            Have feedback, found a bug, or want to say hello? Send me a message
            here.
          </p>
        </div>

        <Card className="contact-form-in mx-auto w-full max-w-xl p-6 sm:p-8 2xl:max-w-2xl 2xl:p-10">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-[0.2em] text-[#78a37a]">
                Name
              </label>

              <Input
                name="name"
                placeholder="Your name"
                required
                disabled={state === "sending"}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-[0.2em] text-[#78a37a]">
                Email
              </label>

              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                disabled={state === "sending"}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-[0.2em] text-[#78a37a]">
                Message
              </label>

              <textarea
                name="message"
                placeholder="Write your message..."
                required
                disabled={state === "sending"}
                className="min-h-40 w-full resize-none rounded-xl border border-blue-200 bg-white/90 px-4 py-3 text-lg font-semibold text-[#173763] outline-none transition focus:border-[#6d94d2] focus:ring-4 focus:ring-blue-200/70 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl"
              />
            </div>

            {message ? (
              <div
                className={`rounded-xl p-4 text-base font-black sm:text-lg ${
                  state === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {message}
              </div>
            ) : null}

            <Button
              type="submit"
              variant="green"
              disabled={state === "sending"}
              className="mt-2 text-lg sm:text-xl"
            >
              {state === "sending" ? "Sending..." : "Send message"}
            </Button>
          </form>
        </Card>
      </section>
    </PageShell>
  );
}