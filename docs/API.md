# API Documentation

## Claude API Integration

Margin Muse uses Anthropic's Claude API to generate writing feedback. This document details the integration.

## API Configuration

### Endpoint
```
POST https://api.anthropic.com/v1/messages
```

### Authentication
```
Header: x-api-key: sk-ant-api03-...
```

### Model
```
claude-sonnet-4-5-20250929
```

**Why this model?**
- Latest Sonnet 4.5 release (January 2025)
- Best balance of quality, speed, and cost
- Strong instruction following
- Excellent at structured JSON output

### Request Parameters

```javascript
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 1500,
  "temperature": 0.7,
  "messages": [
    {
      "role": "user",
      "content": "{FULL_PROMPT}"
    }
  ]
}
```

**Parameter Rationale:**
- `max_tokens: 1500` - Enough for 5 detailed comments (~300 tokens each)
- `temperature: 0.7` - Balanced creativity and consistency

## Prompt Engineering

### Prompt Structure

```
{PERSONA_SYSTEM_PROMPT}

USER'S WRITING GOALS:
{user_goals || "No specific goals provided. Provide general writing feedback."}

CONTEXT (for understanding):
"{context_text}"

TEXT TO ANALYZE (last ~50 words - focus your feedback here):
"{focus_text}"

INSTRUCTIONS:
Provide 1-5 specific, actionable feedback points about the TEXT TO ANALYZE section.
For each point:
1. Identify which category it belongs to: Structure, Style, Critical Thinking, or Technical
2. Provide specific, constructive feedback
3. Reference exact phrases from the text when relevant

Respond ONLY with a JSON array in this exact format:
[
  {
    "category": "Structure",
    "comment": "Your specific feedback here..."
  }
]

Valid categories: "Structure", "Style", "Critical Thinking", "Technical"

Focus on craft-based improvements. Be constructive and specific. Do NOT rewrite the text.
```

### Context Window Strategy

**Problem:** 50 words alone lack context for meaningful feedback.

**Solution:** Send 150 words total:
- **100 words of context** (for understanding)
- **50 words to focus on** (for feedback)

**Example:**
```
Context (100 words):
"Climate change represents one of the most pressing challenges facing humanity today.
Scientists have documented rising global temperatures, melting ice caps, and increasingly
extreme weather events across the planet. The evidence is overwhelming that human activity,
particularly the burning of fossil fuels, is the primary driver of these changes. Despite
this scientific consensus, political action remains inadequate..."

Focus (50 words):
"Many policymakers continue to prioritize short-term economic concerns over long-term
environmental sustainability. This short-sighted approach ignores the catastrophic economic
costs of inaction. We need bold leadership and immediate action to transition to renewable
energy sources before it's too late."
```

**Prompt Tells Claude:** "Focus your feedback on the last 50 words, but use the context for understanding."

## Persona Prompts

### Kind Teacher

```
You are a supportive and encouraging writing teacher. Your goal is to build the writer's
confidence whilst gently pointing out areas for improvement.

STYLE GUIDELINES:
- Always start with something positive
- Use phrases like "I really like..." and "One thing to consider..."
- Frame suggestions as opportunities rather than corrections
- Be warm, specific, and constructive
- Avoid harsh criticism; focus on growth

Your feedback should help the writer feel motivated to improve while clearly understanding
what to work on.
```

**Example Output:**
```json
[
  {
    "category": "Style",
    "comment": "I really like your passionate tone here - it conveys urgency effectively. One thing to consider: the phrase 'before it's too late' is a bit clichéd. Could you express this urgency in a more original way?"
  },
  {
    "category": "Structure",
    "comment": "You've built a strong argument! The transition from scientific evidence to political inaction works well. Consider adding a specific example of inadequate policy to make this section more concrete."
  }
]
```

### Oxford Professor

```
You are a rigorous Oxford academic with high standards for intellectual work. Your feedback
is precise, demanding, and focused on the quality of argumentation and evidence.

STYLE GUIDELINES:
- Expect substantiation for all claims
- Demand engagement with counterarguments
- Require clear logical progression
- Use academic vocabulary naturally
- Don't soften criticism, but remain constructive
- Focus on intellectual rigor and depth

Your feedback should push the writer toward scholarly excellence.
```

**Example Output:**
```json
[
  {
    "category": "Critical Thinking",
    "comment": "The assertion that policymakers 'continue to prioritize short-term economic concerns' requires evidence. Which policymakers? What specific decisions demonstrate this? Unsubstantiated claims weaken your argument."
  },
  {
    "category": "Structure",
    "comment": "You claim inaction has 'catastrophic economic costs' but provide no data. This is a missed opportunity. Cite specific economic projections or studies to substantiate this critical point."
  },
  {
    "category": "Style",
    "comment": "The phrase 'before it's too late' is vague and emotive rather than precise. What is the specific timeframe? What constitutes 'too late'? Academic writing demands precision."
  }
]
```

### Socrates

```
You are Socrates, employing the Socratic method through questioning. Rather than telling the
writer what to change, ask probing questions that encourage them to think more deeply.

STYLE GUIDELINES:
- Use questions like "What do you mean by this?"
- Ask "What assumptions underlie this statement?"
- Probe with "What would someone who disagrees say?"
- Challenge definitions and concepts
- Lead through inquiry, not instruction
- Help the writer discover improvements themselves

Your feedback should spark critical examination and self-discovery.
```

**Example Output:**
```json
[
  {
    "category": "Critical Thinking",
    "comment": "What do you mean by 'short-sighted approach'? Short-sighted compared to what timeframe? What assumptions are you making about how policymakers should weigh present versus future concerns?"
  },
  {
    "category": "Structure",
    "comment": "You state we need 'bold leadership' - but what does bold leadership look like in practice? Can you envision a specific policy that would exemplify this? How would you respond to someone who says we already have bold leadership but disagree on the solutions?"
  },
  {
    "category": "Style",
    "comment": "Consider: does the phrase 'before it's too late' invite readers to think critically, or does it shut down nuanced discussion? What would make your conclusion more thought-provoking?"
  }
]
```

## Response Parsing

### Expected Format

```json
[
  {
    "category": "Structure|Style|Critical Thinking|Technical",
    "comment": "Specific feedback text..."
  }
]
```

### Parsing Strategies

Claude sometimes includes extra text or formatting. We handle this with multiple strategies:

#### Strategy 1: Direct JSON Parse
```javascript
try {
  return JSON.parse(responseText);
} catch (e) {
  // Continue to next strategy
}
```

#### Strategy 2: Extract from Markdown Code Block
```javascript
const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
if (match) {
  return JSON.parse(match[1]);
}
```

**Handles:**
```markdown
Here's the feedback:

```json
[
  {"category": "Style", "comment": "..."}
]
```

Hope this helps!
```

#### Strategy 3: Find JSON Array Anywhere
```javascript
const arrayMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
if (arrayMatch) {
  return JSON.parse(arrayMatch[0]);
}
```

**Handles:**
```
Let me analyze that for you. [{"category": "Style", "comment": "..."}] These are my thoughts.
```

#### Strategy 4: Fallback
```javascript
return [{
  category: 'General',
  comment: responseText.trim()
}];
```

Treats entire response as single comment if JSON parsing fails.

### Validation

After parsing, validate each feedback item:

```javascript
function validateFeedback(feedback) {
  const validCategories = ['Structure', 'Style', 'Critical Thinking', 'Technical', 'General'];

  return feedback
    .filter(item => item && typeof item === 'object')
    .filter(item => item.comment && item.comment.trim().length > 0)
    .map(item => ({
      category: validCategories.includes(item.category) ? item.category : 'General',
      comment: item.comment.trim()
    }))
    .slice(0, 5); // Max 5 comments
}
```

## Error Handling

### HTTP Status Codes

#### 401 Unauthorized
```json
{
  "error": {
    "type": "invalid_api_key",
    "message": "Invalid API key"
  }
}
```

**User Message:**
```
Title: Invalid API Key
Message: Your Claude API key appears to be invalid. Please check your settings and try again.
Action: Open Settings
```

#### 429 Rate Limit
```json
{
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded"
  }
}
```

**User Message:**
```
Title: Rate Limit Reached
Message: You've reached the API rate limit. Please wait a moment before analyzing more text.
Action: Learn More (link to docs)
```

**Retry Strategy:**
- Wait 1s, retry
- Wait 2s, retry
- Wait 4s, retry
- Give up, show error

#### 500 Server Error
```json
{
  "error": {
    "type": "server_error",
    "message": "Internal server error"
  }
}
```

**User Message:**
```
Title: Service Temporarily Unavailable
Message: The Claude API is experiencing issues. Please try again in a few moments.
Action: Check Status (link to status.anthropic.com)
```

#### 529 Overloaded
**User Message:**
```
Title: Service Temporarily Unavailable
Message: The Claude API is currently overloaded. Please try again shortly.
Action: Check Status
```

### Network Errors

```javascript
catch (error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to reach Claude API. Check your internet connection and try again.',
      action: null
    };
  }
}
```

## Cost Estimation

### Pricing (Claude Sonnet 4.5)
- **Input:** $3 per million tokens (~750k words)
- **Output:** $15 per million tokens (~750k words)

### Per-Analysis Cost

**Input tokens:**
- Persona prompt: ~200 tokens
- User goals: ~50 tokens
- Context (150 words): ~200 tokens
- Instructions: ~150 tokens
- **Total input:** ~600 tokens = $0.0018

**Output tokens:**
- 5 comments @ ~100 tokens each: ~500 tokens
- **Total output:** ~500 tokens = $0.0075

**Total per analysis:** ~$0.009 (less than 1 cent)

### Monthly Cost Estimate

**Light user** (500 words/day):
- 10 analyses/day
- 300 analyses/month
- **Cost:** ~$2.70/month

**Heavy user** (2000 words/day):
- 40 analyses/day
- 1200 analyses/month
- **Cost:** ~$10.80/month

**Very heavy user** (5000 words/day):
- 100 analyses/day
- 3000 analyses/month
- **Cost:** ~$27/month

## Rate Limits

### Anthropic Rate Limits (Varies by Tier)

**Free Tier:**
- 50 requests per minute
- 1,000 requests per day

**Build Tier 1:**
- 1,000 requests per minute
- 20,000 requests per day

**Build Tier 2:**
- 2,000 requests per minute
- 50,000 requests per day

### Impact on Margin Muse

**Typical usage:**
- 1 request per 50 words written
- Average writing speed: 40-60 words per minute
- **Rate:** ~1 request per minute

**Conclusion:** Even free tier is more than sufficient for typical usage.

**Edge case:** Very fast typing or large paste might hit rate limit:
- Extension automatically retries with backoff
- User sees "Rate limit reached" message

## Testing the API

### Manual API Test

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 1500,
    "messages": [
      {
        "role": "user",
        "content": "Test prompt here..."
      }
    ]
  }'
```

### Testing in Extension

Add test button to popup (development only):

```javascript
// In popup.js
document.getElementById('test-api').addEventListener('click', async () => {
  const settings = await StorageManager.getSettings();
  const client = new ClaudeAPIClient(settings.apiKey);

  try {
    const prompt = buildPrompt(
      settings.persona,
      "This is test context text for testing the API integration.",
      "This is the focus text.",
      settings.goals
    );

    const feedback = await client.generateFeedback(prompt);
    console.log('Test successful:', feedback);
    alert('API test successful! Check console for details.');
  } catch (error) {
    console.error('Test failed:', error);
    alert(`API test failed: ${error.message}`);
  }
});
```

## API Best Practices

### 1. Request Optimization
- ✅ Send context + focus (not full document)
- ✅ Limit to 1500 max tokens output
- ✅ Use appropriate temperature (0.7)
- ❌ Don't send requests for every keystroke

### 2. Error Handling
- ✅ Retry on 429, 500, 529
- ✅ Show user-friendly error messages
- ✅ Provide actionable next steps
- ❌ Don't expose raw API errors to users

### 3. Rate Limiting
- ✅ Track pending calls (prevent concurrent requests)
- ✅ Cancel requests if user closes document
- ✅ Implement exponential backoff
- ❌ Don't spam API with rapid requests

### 4. Security
- ✅ Store API key in Chrome encrypted storage
- ✅ Send API key in headers only (not URL)
- ✅ Never log API key
- ❌ Don't include API key in error messages

### 5. Cost Management
- ✅ Only trigger on 50-word threshold
- ✅ Send context window, not full document
- ✅ Educate users about costs
- ❌ Don't auto-trigger on idle documents

## Future API Enhancements

### Streaming Responses
```javascript
// Future: Stream feedback as it's generated
const stream = await client.generateFeedbackStream(prompt);
for await (const chunk of stream) {
  sidebar.appendFeedback(chunk);
}
```

**Benefits:**
- Faster perceived latency
- Progressive loading UX

**Challenges:**
- Parsing partial JSON
- Handling stream errors

### Caching
```javascript
// Future: Cache recent analyses
const cacheKey = hashText(focusText);
const cached = await cache.get(cacheKey);
if (cached) {
  return cached;
}
```

**Benefits:**
- Instant feedback for repeated text
- Cost savings

**Challenges:**
- Cache invalidation
- Storage limits

### Batching
```javascript
// Future: Batch multiple sections
const feedback = await client.generateFeedbackBatch([
  { context: '...', focus: '...' },
  { context: '...', focus: '...' }
]);
```

**Benefits:**
- Fewer API calls
- Cost efficiency

**Challenges:**
- More complex prompt engineering
- Increased latency

---

For Claude API documentation, see: https://docs.anthropic.com/
