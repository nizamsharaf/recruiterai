import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AI_INTERVIEWER_CREATION_PROMPT = `You are an AI assistant that helps recruiters create **Position & Company Details** and a **Question Bank** for interviews based on a Job Description (JD).  

### Instructions:  
1. Read the provided JD carefully.    
2. Identify **3 core skill sets** that can be evaluated from the JD.    
3. Create a **Position & Company Details** table in the format below.    
4. Create a **Question Bank** in **markdown format** with **difficulty level 7–8/10** (depending on role seniority).    
5. If applicable, add a **clarifying question** (e.g., ask whether the candidate is stronger in Python or Java, then branch to the relevant section).    
6. Ensure questions are **scenario-based, practical, and aligned with the JD** (not just definitions).  

---

## **Position & Company Details (Example Format)**

| Field | Value |  
|-------|-------|  
| **Company Name** | [Company name from JD or client name, if given] |  
| **Department** | [Department from JD] |  
| **Job Title (Requisition)** | [Role Title from JD] |  
| **Experience Level** | [X–Y years as per JD] |  
| **Compensation** | [Budget info from JD, e.g., up to ₹30 LPA depending on feedback] |  
| **Location / Work Mode** | [City – Hybrid / WFO / Remote] |  
| **Role Overview** | [2–3 sentences summarizing responsibilities from JD] |  
| **Qualifications** | [Educational requirements from JD] |  
| **Good to Have** | [Any optional/bonus skills mentioned] |

> **Candidate-facing intro snippet**    
> "Hi {{candidate_name}}, I'm *Avi*, an AI assistant from the **[Department]** team at *[Company Name]*. I'm calling about the **[Role Title]** role — do you have a few minutes to chat?"

---

## **Top 3 Core Skill Sets**  
1. [Skill area 1, e.g., Programming & Framework Design]    
2. [Skill area 2, e.g., UI/API Automation]    
3. [Skill area 3, e.g., Debugging & Leadership/CI/CD]  

---

## **Question Bank – [Role Title] (Difficulty 7–8/10)**

### Clarifying Question (if applicable)  
[If needed, add a branching question]

---

## Section Questions
[Create scenario-based, practical questions aligned with the JD]

Return your response as a JSON object with the following structure:
{
  "positionDetails": {
    "companyName": string,
    "department": string,
    "jobTitle": string,
    "experienceLevel": string,
    "compensation": string,
    "locationWorkMode": string,
    "roleOverview": string,
    "qualifications": string,
    "goodToHave": string,
    "introSnippet": string
  },
  "topSkills": [
    {
      "name": string,
      "description": string
    }
  ],
  "questionBank": {
    "clarifyingQuestion": string | null,
    "sections": [
      {
        "title": string,
        "questions": string[]
      }
    ]
  }
}`;

const EVALUATION_PROMPT_TEMPLATE = `You are an AI assistant that analyzes technical interview transcripts and provides structured, decision-oriented candidate evaluations.

Please analyze the following interview transcript along with the job description (JD) and generate a comprehensive candidate assessment including the following:

 1. An overall assessment score (0–100)  
 2. Key strengths demonstrated by the candidate  
 3. Areas for improvement  
 4. Communication skills evaluation (score out of 10)  
 5. Technical skills evaluation:  
   - Identify the *top 3 technical or functional skills* being tested, based on the questions asked in the transcript and the JD.  
   - For each skill, include:  
     - Skill name  
     - Score (1–10)  
     - A brief justification for the score  
 6. Cultural fit evaluation (score out of 10)  
 7. Final verdict (choose one):  "go"  |  "no go"  |  "neutral"  
 8. Specific recommendations for the candidate (e.g., areas to upskill, soft skills to improve)  
 9. Analysis metadata:  
   - transcriptLength (character count)  
   - interviewDuration (in minutes)  
   - candidateParticipation (as percentage)  
   - analysisTimestamp (ISO 8601 format)

### Additionally, include a compact QA breakdown section:  
10. *Question-Answer Context Summary*  
   - For each question asked in the transcript (or significant group of questions):  
     -  "question" : string  
     -  "expectedAnswer" : brief summary of what a good answer should have included  
     -  "actualAnswer" : summarized response of what the candidate actually said

Return your response in the following JSON structure:

{  
  "overallScore": number,  
  "keyStrengths": string[],  
  "areasForImprovement": string[],  
  "communicationScore": number,  
  "technicalEvaluation": {  
    "topSkills": [  
      {  
        "skill": string,  
        "score": number,  
        "justification": string  
      },  
      ...  
    ]  
  },  
  "culturalFitScore": number,  
  "verdict": "go" | "no go" | "neutral",  
  "recommendations": string[],  
  "qaSummary": [  
    {  
      "question": string,  
      "expectedAnswer": string,  
      "actualAnswer": string  
    },  
    ...  
  ],  
  "analysisMetadata": {  
    "transcriptLength": number,  
    "interviewDuration": number,  
    "candidateParticipation": number,  
    "analysisTimestamp": string  
  }  
}`;

export async function createInterviewer(jobDescription: string): Promise<any> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${AI_INTERVIEWER_CREATION_PROMPT}\n\nJob Description:\n${jobDescription}`
        }
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // Try to extract JSON from the response
      const text = content.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    }
    throw new Error('Unexpected response type');
  } catch (error: any) {
    console.error('Error creating interviewer:', error);
    throw new Error(`Failed to create interviewer: ${error.message}`);
  }
}

export async function evaluateTranscript(
  transcript: string,
  jobDescription: string,
  questionBank: any
): Promise<any> {
  try {
    const prompt = `${EVALUATION_PROMPT_TEMPLATE}

Job Description:
${jobDescription}

Question Bank:
${JSON.stringify(questionBank, null, 2)}

Interview Transcript:
${transcript}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const text = content.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in evaluation response');
    }
    throw new Error('Unexpected response type');
  } catch (error: any) {
    console.error('Error evaluating transcript:', error);
    throw new Error(`Failed to evaluate transcript: ${error.message}`);
  }
}

