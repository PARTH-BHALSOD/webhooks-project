# GitHub Webhook Setup Guide

## ✅ What I Built for You

Your GitHub webhook system is now complete! Here's what was created:

### Files Created:
1. **models/Notification.js** - Tracks sent notifications (prevents duplicates)
2. **services/notifier.js** - Sends Discord messages with deduplication
3. **handlers/githubHandler.js** - Business logic for GitHub events
4. **middleware/githubSignature.js** - Verifies GitHub's signature
5. **controllers/githubController.js** - Processes GitHub webhook requests
6. **routes/webhookRoutes.js** - Added `/github` endpoint
7. **services/webhookProcessor.js** - Updated to handle GitHub events

---

## 🎯 How It Works (Simple Explanation)

**Before:**
- Someone pushes code to GitHub
- Your server receives it but only logs it
- Nothing else happens

**Now:**
- Someone pushes code to GitHub
- Your server receives it
- **Saves it to database**
- **Sends a Discord notification** like: "🚀 John pushed 3 commits to repo:main"
- If the worker retries, it won't send duplicate notifications

---

## 📋 Setup Steps

### Step 1: Get Discord Webhook URL

1. Go to your Discord server
2. Click on a channel → **Edit Channel** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Copy the **Webhook URL**
5. Update your `.env` file:
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ACTUAL_URL_HERE
   ```

### Step 2: Set Up ngrok (to expose localhost)

GitHub can't reach `localhost:5001`, so we use ngrok:

```bash
# Install ngrok if you don't have it
# Download from: https://ngrok.com/download

# Run ngrok
ngrok http 5001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5001
```

**Copy that https URL** (e.g., `https://abc123.ngrok.io`)

### Step 3: Configure GitHub Webhook

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in:
   - **Payload URL**: `https://abc123.ngrok.io/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Create a secret (e.g., `my-github-secret-2024`)
   - **Events**: Select "Just the push event" (or "Send me everything")
4. Click **Add webhook**

### Step 4: Update Your .env

Update your `.env` file with the secret you just created:

```env
GITHUB_WEBHOOK_SECRET=my-github-secret-2024
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ACTUAL_URL
```

### Step 5: Start Everything

Open 3 terminals:

**Terminal 1 - Start MongoDB (if not running):**
```bash
# MongoDB is already running in your cloud, so skip this
```

**Terminal 2 - Start Redis:**
```bash
redis-server
```

**Terminal 3 - Start Your Server:**
```bash
cd "D:\Webhook project\backend"
node server.js
```

**Terminal 4 - Start Worker:**
```bash
cd "D:\Webhook project\backend"
node workers/webhookWorker.js
```

---

## 🧪 Test It

### Test 1: Push to GitHub

1. Make sure ngrok is running
2. Make sure your server is running
3. Make a commit and push to your GitHub repo:
   ```bash
   git add .
   git commit -m "test webhook"
   git push
   ```

4. **Check Discord** - you should see a message like:
   ```
   🚀 YourName pushed 1 commit(s) to repo:main
   📝 "test webhook"
   🔗 https://github.com/...compare/...
   ```

### Test 2: Check Database

Check MongoDB to see the saved event:
```bash
# The webhook event is saved in your MongoDB
# Collection: webhookevents
# You can check it in MongoDB Compass or Atlas
```

---

## 🐛 Troubleshooting

### Issue: "Missing GitHub signature"
- Make sure you set `GITHUB_WEBHOOK_SECRET` in `.env`
- Make sure it matches what you put in GitHub webhook settings

### Issue: "Discord failed"
- Check your `DISCORD_WEBHOOK_URL` is correct
- Test it manually:
  ```bash
  curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"content": "Test message"}'
  ```

### Issue: No Discord message received
1. Check the server logs - is the webhook arriving?
2. Check the worker logs - is it processing?
3. Check MongoDB - is the event saved?
4. Check the Notification collection - any errors?

### Issue: Duplicate notifications
- This is fixed! The `dedupeKey` prevents duplicates even on retries

---

## 📊 What Gets Logged

**When GitHub sends a webhook:**

1. **Server receives it** → Logs: "GitHub push event saved: 507f1f77..."
2. **Saves to database** → Status: RECEIVED
3. **Adds to queue** → BullMQ queues it
4. **Worker picks it up** → Status: PROCESSING
5. **Handler runs** → Sends Discord notification
6. **Success** → Status: SUCCESS

---

## 🎨 Customize It

### Want to handle Pull Requests too?

The handler already has PR code! Just make sure GitHub sends PR events:
- Go to webhook settings → Edit → Select "Pull requests"

You'll get notifications like:
```
🔔 Sarah opened PR #42: "Fix login bug"
🔗 https://github.com/user/repo/pull/42
```

### Want to customize the message format?

Edit `handlers/githubHandler.js` - change the `message` variable:
```javascript
const message = `Whatever format you want: ${pusherName}, ${branch}, etc.`;
```

---

## ✨ You're Done!

Your webhook system is now:
- ✅ Receiving GitHub events
- ✅ Verifying signatures (secure)
- ✅ Saving to database
- ✅ Queueing for processing
- ✅ Sending Discord notifications
- ✅ Preventing duplicates
- ✅ Handling retries

Push some code and watch the magic happen! 🚀
