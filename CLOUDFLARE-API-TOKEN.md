# Creating a Secure Cloudflare API Token

Follow these steps to create a secure API token with required permissions for CDN setup:

## 1. Access API Tokens Page
1. Log in to your Cloudflare dashboard
2. Go to "My Profile" (click your profile icon in top right)
3. Click "API Tokens" in the left menu
4. Click "Create Token"

## 2. Create Custom Token
1. Click "Create Custom Token"
2. Name: "ServiceSphere CDN Setup"

## 3. Configure Token Permissions
Add each permission exactly as shown, using all three dropdowns (Resource - Permission - Access Level):

```
Zone - Cache Purge: Edit
Zone - Zone Settings: Edit
Account - Workers Scripts: Edit
Zone - Workers Routes: Edit
Zone - Page Rules: Edit
Zone - DNS: Edit
Zone - SSL and Certificates: Edit
Zone - Workers Routes: Edit
Zone - Cache Rules: Edit
Zone - Page Rules: Edit
Account - Pages: Edit
Account - Access: Applications: Edit
Account - Access: Service Tokens: Edit
```

Note: Some permissions appear twice in the interface (like Page Rules and Workers Routes) - this is normal, add them both times as shown.

## 4. Configure Token Settings
### Account Resources
```
Include: All accounts
```

### Zone Resources
```
Include: All zones
```

### Client IP Address Filtering
```
Operator: Select item...
Value: [Optional: Your IP address if you want to restrict access]
```

### TTL (Token Expiration)
```
Start Date: [Today's date]
End Date: [Tomorrow's date]
```

## 5. Create Token
1. Click "Continue to Summary"
2. Review permissions
3. Click "Create Token"
4. IMPORTANT: Copy the token immediately - it will only be shown once

## 6. Provide the Token
After creating the token, collect these three pieces of information:

1. API Token:
   - Shown immediately after token creation
   - Copy it immediately - it won't be shown again

2. Zone ID:
   - Go to your domain's overview page
   - Find in right sidebar under "API" section
   - Format: 32-character string

3. Account ID:
   - In dashboard URL: https://dash.cloudflare.com/<account-id>
   - Format: 32-character string

Create `.env.cloudflare` file with:
```env
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

## Security Notes
1. Double-check all permissions are set to "Edit" in the third dropdown
2. Some permissions appear twice - add both instances
3. Token expires in 24 hours by default
4. Keep the token secure - it has significant permissions
5. Monitor the audit logs during setup
6. Revoke the token after setup is complete

## Next Steps
Once you have:
1. Created the API token
2. Found your Zone ID
3. Found your Account ID

Share these three pieces of information securely, and we can proceed with the CDN setup using our automated scripts.

## Important Security Reminders
- Never share your Cloudflare login credentials
- Keep the API token secure
- Revoke the token after setup is complete
- Monitor the audit logs during setup
