# BeautyConnect backend

## Local eSewa testing

The API's Development settings use eSewa's public UAT test credentials, so a fresh
checkout can initiate test payments without copying machine-specific user secrets.
Run the API with the `https` launch profile to use the configured local callback
URLs. These credentials are for UAT only; configure your own merchant credentials
through .NET user-secrets or environment variables for any live deployment. Never
put live eSewa credentials in `appsettings*.json` or commit them.
