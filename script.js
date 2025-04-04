// No API key defined here yet—we’ll add it after you generate one
let GEMINI_API_KEY = 'AIzaSyDarB9TqKuL09GLax2x9hxVS2q0z4kn-GQ';

// Store scheduled meetings
let scheduledMeetings = [];

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupChatbot();
    loadScheduledMeetings();
});

function setupEventListeners() {
    const meetingForm = document.getElementById('meeting-form');
    const contactForm = document.getElementById('contact-form');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    meetingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        scheduleMeeting();
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendContactMessage();
    });

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

function setupChatbot() {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const closeButton = document.getElementById('close-chatbot');

    chatbotButton.addEventListener('click', () => {
        chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'flex' : 'none';
        if (chatbotWindow.style.display === 'flex') chatbotInput.focus();
    });

    closeButton.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });

    const greeting = "Greetings, traveler! I’m CosmoBot, your cosmic guide. Ask me about your meetings or say hello!";
    addMessageToChat('bot', greeting);

    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim().toLowerCase();
    if (!message) return;

    addMessageToChat('user', message);
    input.value = '';

    const typingIndicator = addMessageToChat('bot', 'Warping through the cosmos...', true);

    // Check if Gemini API key is available; otherwise, use mock response
    if (GEMINI_API_KEY) {
        getGeminiResponse(message)
            .then(response => {
                typingIndicator.remove();
                addMessageToChat('bot', response);
            })
            .catch(() => {
                typingIndicator.remove();
                addMessageToChat('bot', getMockResponse(message));
            });
    } else {
        setTimeout(() => {
            typingIndicator.remove();
            addMessageToChat('bot', getMockResponse(message));
        }, 1000); // Simulate delay for realism
    }
}

function addMessageToChat(sender, message, isTyping = false) {
    const chatbotMessages = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}${isTyping ? ' typing' : ''}`;
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return messageDiv;
}

async function getGeminiResponse(message) {
    const prompt = `You are CosmoBot, a cosmic AI assistant for meeting scheduling. Respond in a grand, friendly tone. 
    Current meetings: ${JSON.stringify(scheduledMeetings, null, 2)}. 
    User message: "${message}". 
    If asked about meetings, use this format:
    Meeting Transmission:
    Title: [Title]
    Date: [Date]
    Time: [Time]
    Duration: [Duration] minutes
    Participants: [Participants]
    Notes: [Notes]
    If asked to schedule a meeting, say: "Warp to the schedule section to command your meeting!" 
    For greetings (hi, hello, bye), respond cosmically (e.g., "Salutations from the stars!" or "Farewell, cosmic traveler!").`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) throw new Error('Cosmic interference detected!');
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function getMockResponse(message) {
    // Fallback mock AI logic for your specific requests
    if (message.includes('when is my meeting') || message.includes('show my meetings')) {
        if (scheduledMeetings.length === 0) {
            return "No meetings detected in the cosmic ledger, traveler!";
        }
        let response = "Behold your cosmic schedule:\n";
        scheduledMeetings.forEach(m => {
            response += `Meeting Transmission:\nTitle: ${m.title}\nDate: ${formatDate(m.date)}\nTime: ${m.time}\nDuration: ${m.duration} minutes\nParticipants: ${m.participants}\nNotes: ${m.preferences || 'None'}\n\n`;
        });
        return response;
    } else if (message.includes('schedule a meeting') || message.includes('book a meeting')) {
        setTimeout(() => window.location.hash = '#schedule', 1000); // Redirect after delay
        return "Warp to the schedule section to command your meeting!";
    } else if (message.includes('hi') || message.includes('hello')) {
        return "Salutations from the stars, fellow traveler!";
    } else if (message.includes('bye') || message.includes('goodbye')) {
        return "Farewell, cosmic traveler! May your orbits align!";
    } else {
        return "The cosmos is vast, and your query intrigues me! Ask about meetings or greetings, and I shall assist!";
    }
}

function scheduleMeeting() {
    const title = document.getElementById('meeting-title').value;
    const date = document.getElementById('meeting-date').value;
    const time = document.getElementById('meeting-time').value;
    const duration = document.getElementById('meeting-duration').value;
    const participants = document.getElementById('meeting-participants').value;
    const preferences = document.getElementById('meeting-preferences').value;

    const meeting = { title, date, time, duration: parseInt(duration), participants, preferences };
    scheduledMeetings.push(meeting);
    localStorage.setItem('scheduledMeetings', JSON.stringify(scheduledMeetings));
    generateSchedule();
    document.getElementById('meeting-form').reset();
    showSuccess('Meeting warped into the cosmos!');
}

function loadScheduledMeetings() {
    const storedMeetings = localStorage.getItem('scheduledMeetings');
    if (storedMeetings) {
        scheduledMeetings = JSON.parse(storedMeetings);
        generateSchedule();
    }
}

function generateSchedule() {
    const scheduleOutput = document.getElementById('schedule-output');
    scheduleOutput.innerHTML = scheduledMeetings.length === 0 ? 'No meetings in the cosmic ledger yet.' : '<h3>Cosmic Schedule</h3>' + scheduledMeetings.map((m, i) => `
        <div class="schedule-item" data-index="${i}">
            <strong>${m.title}</strong><br>
            Date: ${formatDate(m.date)}<br>
            Time: ${m.time}<br>
            Duration: ${m.duration} minutes<br>
            Participants: ${m.participants}<br>
            Notes: ${m.preferences || 'None'}<br>
            <button class="delete-button" onclick="deleteMeeting(${i})">Delete</button>
        </div>`).join('');
}

function deleteMeeting(index) {
    scheduledMeetings.splice(index, 1);
    localStorage.setItem('scheduledMeetings', JSON.stringify(scheduledMeetings));
    generateSchedule();
    showSuccess('Meeting erased from the cosmos!');
}

function sendContactMessage() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    console.log('Contact:', { name, email, message });
    showSuccess('Message sent across the stars!');
    document.getElementById('contact-form').reset();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #00d4ff, #8a2be2); color: #fff; padding: 15px 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index: 3000; font-family: Orbitron, sans-serif;';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}