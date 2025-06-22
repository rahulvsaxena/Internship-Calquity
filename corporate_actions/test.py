import streamlit as st
from phi.agent import Agent
from phi.model.google import Gemini
from phi.tools.csv_tools import CsvTools
import os

# Page configuration
st.set_page_config(
    page_title="Financial Data Analyst",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for better styling
st.markdown("""
<style>
    /* Basic reset and body font */
    body {
        font-family: 'Segoe UI', sans-serif;
    }

    /* Header */
    .main-header {
        text-align: center;
        padding: 1.5rem;
        background: #2d2f31;
        color: white;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
    }

    /* Message Bubbles */
    .user-message {
        background: #e0f7fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 5px solid #0288d1;
        color: #000;
    }

    .agent-response {
        background: #ede7f6;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 5px solid #5e35b1;
        color: #000;
    }

    /* Input Field Styling */
    .stTextInput > div > div > input {
        border-radius: 8px;
        padding: 0.5rem;
        font-size: 1rem;
    }

    /* Buttons */
    .stButton > button {
        background: #5e35b1;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .stButton > button:hover {
        background: #4527a0;
        transform: translateY(-1px);
    }
1537.379
    /* Info box */
    .info-box {
        background: #fff;
        border-left: 4px solid #ff9800;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        color: #333;
    }
</style>
""", unsafe_allow_html=True)


# Initialize session state
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

if 'agent' not in st.session_state:
    st.session_state.agent = None

# Header
st.markdown("""
<div class="main-header">
    <h1>📊 Financial Data Analyst AI</h1>
    <p>Ask questions about your financial data and get instant insights</p>
</div>
""", unsafe_allow_html=True)

# Initialize the agent
def initialize_agent():
    """Initialize the Phi agent with CSV tools"""
    try:
        agent = Agent(
            model=Gemini(id="gemini-1.5-flash"),
            tools=[CsvTools(csvs=["data.csv"])],
            markdown=True,
            show_tool_calls=False,  # Hide tool calls for cleaner UI
            instructions=[
                "You are a financial data analyst. Always use data.csv as your data source.",
                "Column names: Name, Sector, Market_Cap, Revenue, PE_Ratio, Dividend_Yield",
                "All numerical columns should be treated as numbers, not text",
                "When displaying results, use simple bullet points or numbered lists instead of complex tables",
                "Keep responses concise and well-formatted",
                "If a query returns no results, explain why clearly",
                "Always include the company name and relevant metrics in your responses",
                "Format numbers with 2 decimal places where appropriate",
                "Provide context: Market_Cap and Revenue are in Crores, Dividend_Yield is percentage",
                "Limit results to top 10 unless specifically asked for more",
                "Use clear, simple language and avoid complex table formatting"
            ],
        )
        return agent
    except Exception as e:
        st.error(f"Failed to initialize agent: {str(e)}")
        return None

# Check if data.csv exists
if not os.path.exists("data.csv"):
    st.error("⚠️ data.csv file not found. Please make sure the CSV file is in the same directory as this app.")
    st.info("The CSV should contain columns: Name, Sector, Market_Cap, Revenue, PE_Ratio, Dividend_Yield")
    st.stop()

# Initialize agent if not already done
if st.session_state.agent is None:
    with st.spinner("🔄 Initializing Financial Data Analyst..."):
        st.session_state.agent = initialize_agent()
        if st.session_state.agent is None:
            st.stop()

# Data info section
with st.expander("📋 Data Information", expanded=False):
    st.markdown("""
    <div class="info-box">
        <h4>Available Data Columns:</h4>
        <ul>
            <li><strong>Name:</strong> Company name</li>
            <li><strong>Sector:</strong> Industry sector</li>
            <li><strong>Market_Cap:</strong> Market capitalization (in Crores)</li>
            <li><strong>Revenue:</strong> Company revenue (in Crores)</li>
            <li><strong>PE_Ratio:</strong> Price-to-Earnings ratio</li>
            <li><strong>Dividend_Yield:</strong> Dividend yield percentage</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

# Sample questions

# Main input section
st.markdown("### 🤔 Ask Your Question:")

# Use sample query if selected
if 'current_query' in st.session_state:
    default_query = st.session_state.current_query
    del st.session_state.current_query
else:
    default_query = ""

user_query = st.text_input(
    "Type your question about the financial data:",
    value=default_query,
    placeholder="e.g., Which companies have the highest PE ratio in the banking sector?",
    key="user_input"
)

col1, col2 = st.columns([1, 4])
with col1:
    ask_button = st.button("🚀 Ask", type="primary")
with col2:
    if st.button("🗑️ Clear Chat"):
        st.session_state.chat_history = []
        st.rerun()

# Process query
if ask_button and user_query.strip():
    if st.session_state.agent:
        # Add user query to chat history
        st.session_state.chat_history.append({"type": "user", "content": user_query})
        
        with st.spinner("🔍 Analyzing your data..."):
            try:
                # Get response from agent
                response = st.session_state.agent.run(user_query)
                
                # Add agent response to chat history
                st.session_state.chat_history.append({"type": "agent", "content": response.content})
                
            except Exception as e:
                st.error(f"❌ Error processing your question: {str(e)}")
                # Remove the user query from history if there was an error
                if st.session_state.chat_history and st.session_state.chat_history[-1]["type"] == "user":
                    st.session_state.chat_history.pop()

elif ask_button and not user_query.strip():
    st.warning("⚠️ Please enter a question before clicking Ask.")

# Display chat history
if st.session_state.chat_history:
    st.markdown("### 💬 Conversation History:")
    
    for i, message in enumerate(reversed(st.session_state.chat_history)):
        if message["type"] == "user":
            st.markdown(f"""
            <div class="user-message">
                <strong>🧑‍💼 You asked:</strong><br>
                {message["content"]}
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div class="agent-response">
                <strong>🤖 Financial Analyst:</strong><br>
                {message["content"]}
            </div>
            """, unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 1rem;">
    <p>🔒 Your data stays local and secure. Ask any questions about your financial dataset!</p>
</div>
""", unsafe_allow_html=True)