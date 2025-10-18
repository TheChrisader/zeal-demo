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
import { useAuth } from "@/hooks/useAuth";
import { validateReferralCode } from "@/services/referral.services";
import {
  appendReferralToUrl,
  generateArticleShareLink,
  generateFacebookShareUrl,
  generateTwitterShareUrl,
} from "@/utils/referral.utils";

const TestEnhancedReferralPage = () => {
  const [referralCode, setReferralCode] = useState("");
  const [testSlug, setTestSlug] = useState("test-article-slug");
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [generatedUrls, setGeneratedUrls] = useState<any>({});

  const {
    user,
    hasReferralCode,
    referralCode: userReferralCode,
    referralCount,
    isAuthenticated,
  } = useAuth();

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

  const handleGenerateUrls = () => {
    const baseUrl = `${window.location.origin}/post/${testSlug}`;
    const urls = {
      base: baseUrl,
      withUserReferral: userReferralCode
        ? appendReferralToUrl(baseUrl, userReferralCode)
        : baseUrl,
      withTestReferral: referralCode
        ? appendReferralToUrl(baseUrl, referralCode)
        : baseUrl,
      twitterShare: userReferralCode
        ? generateTwitterShareUrl(
            "Check out this article!",
            baseUrl,
            userReferralCode,
          )
        : generateTwitterShareUrl("Check out this article!", baseUrl),
      facebookShare: userReferralCode
        ? generateFacebookShareUrl(baseUrl, userReferralCode)
        : generateFacebookShareUrl(baseUrl),
    };
    setGeneratedUrls(urls);
  };

  const handleTestSignupLink = (code?: string) => {
    const codeToUse = code || referralCode;
    if (!codeToUse) {
      toast.error("No referral code available");
      return;
    }
    const testUrl = `${window.location.origin}?ref=${codeToUse}`;
    window.open(testUrl, "_blank");
  };

  const handleTestArticleShare = (code?: string) => {
    const codeToUse = code || userReferralCode;
    const shareUrl = generateArticleShareLink(
      testSlug,
      codeToUse,
      window.location.origin,
    );
    window.open(shareUrl, "_blank");
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Referral System Test</CardTitle>
          <CardDescription>
            Test the enhanced referral system with auth integration and URL
            sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Status */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-medium text-blue-900">Auth Status:</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
              {user && (
                <>
                  <p>
                    User: {user.display_name} (@{user.username})
                  </p>
                  <p>Has Referral Code: {hasReferralCode ? "Yes" : "No"}</p>
                  <p>Referral Code: {userReferralCode || "None"}</p>
                  <p>Referral Count: {referralCount}</p>
                </>
              )}
            </div>
          </div>

          {/* Referral Code Validation */}
          <div className="space-y-2">
            <h3 className="font-medium">Test Referral Code Validation:</h3>
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

          {/* URL Generation */}
          <div className="space-y-2">
            <h3 className="font-medium">URL Generation Test:</h3>
            <div className="flex gap-2">
              <Input
                value={testSlug}
                onChange={(e) => setTestSlug(e.target.value)}
                placeholder="Article slug"
              />
              <Button onClick={handleGenerateUrls}>Generate URLs</Button>
            </div>
          </div>

          {Object.keys(generatedUrls).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Generated URLs:</h3>
              <div className="space-y-2">
                {Object.entries(generatedUrls).map(([key, url]) => (
                  <div key={key} className="rounded bg-gray-50 p-2">
                    <div className="mb-1 text-xs font-medium text-gray-600">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </div>
                    <div className="break-all font-mono text-sm">{url}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="space-y-2">
            <h3 className="font-medium">Test Actions:</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => handleTestSignupLink()}
                disabled={!referralCode}
                className="w-full"
              >
                Test Signup with Test Code
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  handleTestSignupLink(userReferralCode || undefined)
                }
                disabled={!userReferralCode}
                className="w-full"
              >
                Test Signup with User Code
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTestArticleShare()}
                className="w-full"
              >
                Test Article Share (No Referral)
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  handleTestArticleShare(userReferralCode || undefined)
                }
                disabled={!userReferralCode}
                className="w-full"
              >
                Test Article Share (With Referral)
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h3 className="font-medium">Navigation:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => window.open("/settings/referral", "_blank")}
                className="w-full"
              >
                Go to Referral Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/signup", "_blank")}
                className="w-full"
              >
                Go to Signup Page
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="mb-2 font-medium text-green-900">
              Enhanced Features to Test:
            </h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-green-800">
              <li>Referral code status available in useAuth hook</li>
              <li>Always-visible referral code input on signup page</li>
              <li>Share buttons automatically include referral codes</li>
              <li>Social media shares include referral codes when logged in</li>
              <li>URL parameter handling with existing query strings</li>
              <li>Fallback mechanisms for non-authenticated users</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEnhancedReferralPage;
