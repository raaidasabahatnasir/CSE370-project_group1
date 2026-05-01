// Test backend connection
async function testBackend() {
    console.log("Sending request to backend...");
    document.getElementById('testResult').textContent = 'Connecting...';

    const data = await apiFetch('/workers');

    if (data) {
        console.log("Response from backend:", data);
        document.getElementById('testResult').textContent = 
            '✅ Connected! Workers found: ' + data.length;
    } else {
        document.getElementById('testResult').textContent = '❌ Connection failed!';
    }
}

// Load all workers
async function loadWorkers() {
    const data = await apiFetch('/workers');
    if (!data) return;

    const tbody = document.getElementById('workerTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No workers found</td></tr>';
        return;
    }

    data.forEach(worker => {
        tbody.innerHTML += `
            <tr>
                <td>${worker.name}</td>
                <td>${worker.role}</td>
                <td>${worker.department}</td>
                <td>${worker.phone || 'N/A'}</td>
                <td>
                    <button onclick="deleteWorker(${worker.id})">Delete</button>
                </td>
            </tr>`;
    });
}

// Add new worker
async function addWorker() {
    const name       = document.getElementById('workerName').value;
    const role       = document.getElementById('workerRole').value;
    const department = document.getElementById('workerDept').value;
    const phone      = document.getElementById('workerPhone').value;

    if (!name || !role || !department) {
        alert('Please fill in all required fields!');
        return;
    }

    const data = await apiFetch('/workers', 'POST', { name, role, department, phone });
    if (data) {
        alert(data.message);
        loadWorkers();
    }
}

// Delete worker
async function deleteWorker(id) {
    if (!confirm('Are you sure?')) return;
    const data = await apiFetch(`/workers/${id}`, 'DELETE');
    if (data) {
        alert(data.message);
        loadWorkers();
    }
}

// Auto load on page ready
document.addEventListener('DOMContentLoaded', loadWorkers);

