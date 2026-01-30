document.addEventListener('DOMContentLoaded', () => {
    const checkStatusBtn = document.getElementById('checkStatus');
    const statusResult = document.getElementById('statusResult');

    checkStatusBtn.addEventListener('click', async () => {
        statusResult.textContent = 'Checking...';
        statusResult.className = 'status-result';

        try {
            const response = await fetch('/api/status');
            const data = await response.json();

            if (data.status === 'success') {
                statusResult.textContent = `✅ ${data.message} (${new Date(data.timestamp).toLocaleString()})`;
                statusResult.classList.add('success');
            } else {
                throw new Error('Unexpected response');
            }
        } catch (error) {
            statusResult.textContent = `❌ Error: ${error.message}`;
            statusResult.classList.add('error');
        }
    });
});
