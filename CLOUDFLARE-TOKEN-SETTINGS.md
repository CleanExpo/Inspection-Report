# Cloudflare API Token Settings

## Token Configuration

1. Token Name:
```
ServiceSphere CDN Setup
```

2. Permissions:
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

3. Account Resources:
```
Include: All accounts
```

4. Zone Resources:
```
Include: All zones
```

5. Client IP Address Filtering:
```
Operator: Select item...
Value: [Optional: Your IP address if you want to restrict access]
```

6. TTL (Token Expiration):
```
Start Date: [Today's date]
End Date: [Tomorrow's date]
```

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

## Important Notes:
- Double-check all permissions are set to "Edit" in the third dropdown
- Some permissions appear twice - add both instances
- Token expires in 24 hours by default
- Keep the token secure - it has significant permissions
- Test the token immediately after creation
