from langchain_google_genai import GoogleGenerativeAI
from langchain_core.prompts import PromptTemplate 
from langchain_core.output_parsers import StrOutputParser
from langchain_core.output_parsers import JsonOutputParser
from langchain.output_parsers import OutputFixingParser
from dotenv import load_dotenv

load_dotenv()

llm=GoogleGenerativeAI(model='gemini-1.5-flash')

parser=StrOutputParser()

prompt1=PromptTemplate(template='''You are an expert AI legal assistant specializing in employment law and Rent Agreement or any Agreement , . Analyze the provided document from the perspective of the {role}.

                                        Your goal is to identify specific clauses, assess their risk, and provide actionable suggestions.
                                        Return your analysis as a single JSON object with two keys: "summary" and "insights".

                                        - The "summary" should be a brief, high-level overview of the document's fairness and any major concerns.
                                        - The "insights" key should be a list of JSON objects, where each object represents a specific point of analysis.

                                        For each insight object in the list, provide the following keys:
                                        - "clause_name": A short, descriptive name for the clause being analyzed (e.g., "Working Hours", "Non-Compete Clause").
                                        - "risk_level": Classify the risk. Must be one of: "High", "Medium", "Low", or "Informational".
                                        - "quote": The exact, verbatim quote from the document that is being analyzed.
                                        - "insight": Your detailed analysis explaining the potential issue, why it's a risk, and any relevant legal context.
                                        - "suggestion": A concrete suggestion for how to improve or rephrase the clause to mitigate the risk.

                                        Here is the document to analyze:
                                        ---
                                        {doc_text}
                                        ---

                                        Respond ONLY with the JSON object. Do not include any other text or markdown formatting.
                                        ''',
                         input_variables=['role', 'doc_text'],
)


def analyze_document(role,doc_text):
    
    json_parser = JsonOutputParser()

    # 2. We wrap it in the OutputFixingParser.
    #    This new parser is given our LLM instance so it can call it again if it needs to fix things.
    output_fixer = OutputFixingParser.from_llm(llm=llm, parser=json_parser)

    # 3. The chain now uses the robust output_fixer instead of the simple json_parser
    chain = prompt1 | llm | output_fixer

    # Invoke the chain as before
    result = chain.invoke({'role': role, 'doc_text': doc_text})

    return result


# doc_text='''1.	We will perform the services described in good faith, but cannot be responsible for the performance, quality, or timely completion of work by others. Further, we shall not be responsible for any changes to the project that the Client, or any other parties of the construction process make without informing the Designer.
# 2.	Reasonable access to the premises will be required for the designer and designer’s agents required to perform the agreed-upon work. By signing this proposal, you understand that the peace and privacy of your home may be disrupted for the time required to perform the work.
# 3.	All invoices must be paid within 30 days of receipt or a 1.25% per day (18% per annum) fee will be added to the total due.
# 4.	Upon completion of the project, the designer may require permission to photograph the project for the firm’s records. The interior designer shall not use the photographs for promotional purposes without permission of the client.
# 5.	This agreement is the complete statement of understanding between the interior designer and the client. No other agreements have been made other than those stated in this agreement. This agreement can only be modified in writing and signed by both parties.
# '''

# role='''employ'''

# result=analyze_document(role,doc_text)

    
# print(result)     




