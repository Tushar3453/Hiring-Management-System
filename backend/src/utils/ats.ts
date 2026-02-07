import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const rawLib = require('pdf-parse');
const PDFParseClass = rawLib.PDFParse;

// Parse Resume 
export const parseResume = async (buffer: Buffer): Promise<string> => {
    try {
        if (!PDFParseClass) throw new Error("Could not find PDFParse class.");

        const uint8Array = new Uint8Array(buffer);
        const parser = new PDFParseClass(uint8Array);
        const data = await parser.getText();
        
        return (data.text || "")
            .replace(/\n/g, ' ') 
            .replace(/\s+/g, ' ') 
            .trim();
    } catch (error) {
        console.error("PDF Parse Error:", error);
        return ""; 
    }
};

// Helper: Remove dots, spaces, hyphens to compare "Next.js" vs "nextjs"
const cleanText = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Removes everything except letters & numbers
};

// Calculate Score
export const calculateATSScore = (resumeText: string, jobSkills: string[]) => {
    if (!resumeText || !jobSkills || jobSkills.length === 0) {
        return { score: 0, missingSkills: jobSkills };
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Create a "Cleaned" version of the resume for searching
    // Example: "I know Node.js and Next.js" -> "iknownodejsandnextjs"
    const cleanedResume = cleanText(resumeText);

    jobSkills.forEach(skill => {
        // Clean the skill
        // Example: "Next.js" -> "nextjs"
        // Example: "NextJS"  -> "nextjs"
        const cleanedSkill = cleanText(skill);

        // Check if the cleaned resume contains the cleaned skill
        if (cleanedResume.includes(cleanedSkill)) {
            matchedSkills.push(skill); // Store the original formatting
        } else {
            missingSkills.push(skill);
        }
    });

    const score = Math.round((matchedSkills.length / jobSkills.length) * 100);

    return { score, missingSkills };
};