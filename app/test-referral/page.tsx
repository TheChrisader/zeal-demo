"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validateReferralCode } from "@/services/referral.services";

const TestReferralPage = () => {
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidateCode = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await validateReferralCode(referralCode.trim());
      setValidationResult(result);

      if (result.valid) {
        toast.success("Referral code is valid!");
      } else {
        toast.error("Invalid referral code");
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      toast.error("Failed to validate referral code");
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignupLink = () => {
    const testUrl = `${window.location.origin}?ref=${referralCode}`;
    window.open(testUrl, "_blank");
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Referral System Test</CardTitle>
          <CardDescription>
            Test the referral code validation and signup flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code to test"
                className="font-mono"
              />
              <Button onClick={handleValidateCode} disabled={isLoading}>
                {isLoading ? "Validating..." : "Validate"}
              </Button>
            </div>
          </div>

          {validationResult && (
            <div className="space-y-2">
              <h3 className="font-medium">Validation Result:</h3>
              <pre className="overflow-auto rounded bg-gray-100 p-3 text-sm">
                {JSON.stringify(validationResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Test Links:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleTestSignupLink}
                disabled={!referralCode.trim()}
                className="w-full"
              >
                Test Signup with Referral Code
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/settings/referral", "_blank")}
                className="w-full"
              >
                Go to Referral Settings
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-medium text-blue-900">How to test:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
              <li>First, generate a referral code from the settings page</li>
              <li>Enter that code in the field above and click "Validate"</li>
              <li>
                Click "Test Signup with Referral Code" to test the full flow
              </li>
              <li>Verify the referral code appears on the signup page</li>
              <li>Complete signup to verify the referral is applied</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReferralPage;
