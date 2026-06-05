# Chatbot UI Runtime Components


This folder owns the learner-facing runtime screen composition for the I2ST UI.

Boundary:

- Keep the conversation engine in `/datadrive/luis/projects/I2ST/chatbot`.
- Keep runtime presentation, layout, and future side-panel UI components here.
- Future grading, emotion-state, and hint panels can be added as UI/runtime services without changing the core chatbot prompt path.

Current state:
- `RuntimeChatScreen.jsx` renders the second screen after `Start Chat`.
- It consumes the existing session, message list, and send-turn handler from `src/main.jsx`.
- It does not add new LLM calls.
