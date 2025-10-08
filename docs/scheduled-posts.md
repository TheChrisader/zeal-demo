# Scheduled Posts Feature

## Overview

This feature allows users to schedule posts to be published at a specific future time. The implementation includes:

- Frontend UI for scheduling posts
- Backend API endpoints for scheduling, updating, and canceling scheduled posts
- Database models updated to support scheduling
- Background job processor to publish scheduled posts

## How it Works

### Frontend

- Users can click the "Schedule" button in the editor
- A modal appears allowing them to select a date and time (limited to hourly intervals)
- The scheduled post is saved to the database with scheduling metadata

### Backend

- API endpoints handle scheduling requests
- Database models include new fields: `scheduled_at`, `isScheduled`
- A cron endpoint processes scheduled posts at regular intervals

### Background Processing

Scheduled posts are processed using a cron endpoint that should be called regularly:

```
GET /api/v1/cron/scheduled-posts
Authorization: Bearer ${process.env.CRON_AUTH_TOKEN}
```

This endpoint:

- Finds all drafts with `isScheduled: true` and `scheduled_at` in the past
- Converts them to published posts
- Updates the draft status to "published"

## Database Schema Changes

### Post Model

- `scheduled_at`: Date when the post should be published (default: null)
- `isScheduled`: Boolean indicating if post is scheduled (default: false)

### Draft Model

- `scheduled_at`: Date when the draft should be published (default: null)
- `isScheduled`: Boolean indicating if draft is scheduled (default: false)

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```
CRON_AUTH_TOKEN=your_secure_cron_auth_token
```

### 2. Cron Job Setup

Set up a cron job or scheduled task to call the endpoint every minute:

Using a cron service:

```
* * * * * curl -X GET -H "Authorization: Bearer $CRON_AUTH_TOKEN" http://yourdomain.com/api/v1/cron/scheduled-posts
```

Or with a service like CronJob.org, GitHub Actions, or a cloud scheduler.

### 3. Deployment

When deploying, ensure that the cron endpoint is properly secured and that only authorized services can access it.

## API Endpoints

### POST /api/v1/schedule-post

Schedule a draft for future publication

```json
{
  "draft": { "id": "draft_id", ... },
  "scheduled_at": "2023-12-25T10:00:00.000Z"
}
```

### PATCH /api/v1/schedule-post/[postId]

Update scheduled time for a post

```json
{
  "scheduled_at": "2023-12-25T15:00:00.000Z"
}
```

### DELETE /api/v1/schedule-post/[postId]

Cancel a scheduled post

## Security Considerations

- The cron endpoint is protected by a Bearer token
- Users can only schedule their own drafts
- Input validation is performed on scheduled dates
