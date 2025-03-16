document.addEventListener("DOMContentLoaded", () => {
    const downloadButton = document.createElement("button");
    downloadButton.id = "download-chat-button";
    downloadButton.innerText = "📥 Download Chats";
    document.body.appendChild(downloadButton);

    downloadButton.addEventListener("click", () => {
        const savedChats = localStorage.getItem("saved-chats");
        if (!savedChats) {
            alert("No chats found to download!");
            return;
        }

        // Convert HTML chat to plain text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = savedChats;
        const chatMessages = tempDiv.querySelectorAll(".message");

        let csvContent = "data:text/csv;charset=utf-8,Role,Message\n";

        chatMessages.forEach(msg => {
            const role = msg.classList.contains("incoming") ? "Bot" : "User";
            const textElement = msg.querySelector(".text");
            if (textElement) {
                let message = textElement.innerText.replace(/"/g, '""'); // Escape quotes
                csvContent += `"${role}","${message}"\n`;
            }
        });

        // Create and trigger a download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "chat_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
