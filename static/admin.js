document.addEventListener('DOMContentLoaded', function() {
    const addWinnerBtn = document.getElementById('addWinnerBtn');
    const winnersContainer = document.getElementById('winnersContainer');
    const clearFormBtn = document.getElementById('clearForm');
    const winnersForm = document.getElementById('winnersForm');
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    
    let winnerCount = 0;
    
    // Daftar kelas yang tersedia
    const availableClasses = [
        "10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8", "10.9", "10.10", "10.11", "10.12", "10.13", "10.14",
        "11.1 (11 IPA 1)", "11.2 (11 IPA 2)", "11.3 (11 IPA 3)", "11.4 (11 IPA 4)", "11.5 (11 IPA 5)",
        "11.6 (11 IPA 6)", "11.7 (11 IPA 7)", "11.8 (11 IPA 8)", "11.9 (11 IPA 9)", "11.10 (11 IPA 10)",
        "11.11 (11 IPS 1)", "11.12 (11 IPS 2)", "11.13 (11 IPS 3)",
        "12.1 (12 IPA 1)", "12.2 (12 IPA 2)", "12.3 (12 IPA 3)", "12.4 (12 IPA 4)", "12.5 (12 IPA 5)",
        "12.6 (12 IPA 6)", "12.7 (12 IPA 7)", "12.8 (12 IPA 8)", "12.9 (12 IPA 9)",
        "12.10 (12 IPS 1)", "12.11 (12 IPS 2)", "12.12 (12 IPS 3)", "12.13 (12 IPS 4)"
      ];
      
    // Fungsi untuk membuat dropdown kelas
    function createClassDropdown() {
        let options = '<option value="">-- Pilih Kelas --</option>';
        availableClasses.forEach(className => {
            options += `<option value="${className}">${className}</option>`;
        });
        return options;
    }
    
    // Fungsi untuk mendapatkan emoji posisi
    function getPositionEmoji(position) {
        switch(position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return position.toString();
        }
    }
    
    // Fungsi untuk mendapatkan kelas badge
    function getPositionClass(position) {
        switch(position) {
            case 1: return 'gold';
            case 2: return 'silver';
            case 3: return 'bronze';
            default: return '';
        }
    }
    
    // Fungsi untuk menambah entry pemenang
    function addWinnerEntry() {
        winnerCount++;
        const winnerEntry = document.createElement('div');
        winnerEntry.className = 'winner-entry';
        winnerEntry.innerHTML = `
            <div class="position-badge ${getPositionClass(winnerCount)}">
                ${getPositionEmoji(winnerCount)}
            </div>
            <div class="form-group">
                <input type="text" name="winners" placeholder="Nama Pemenang ${winnerCount}" required>
            </div>
            <div class="form-group">
                <select name="classes" required>
                    ${createClassDropdown()}
                </select>
            </div>
            <button type="button" class="btn btn-danger remove-winner" onclick="removeWinnerEntry(this)">
                ❌
            </button>
        `;
        winnersContainer.appendChild(winnerEntry);
        updatePreview();
    }
    
    // Fungsi untuk menghapus entry pemenang
    window.removeWinnerEntry = function(button) {
        const entry = button.parentElement;
        entry.remove();
        updateWinnerNumbers();
        updatePreview();
    };
    
    // Fungsi untuk update nomor urut pemenang
    function updateWinnerNumbers() {
        const entries = winnersContainer.querySelectorAll('.winner-entry');
        winnerCount = entries.length;
        
        entries.forEach((entry, index) => {
            const position = index + 1;
            const badge = entry.querySelector('.position-badge');
            const input = entry.querySelector('input[name="winners"]');
            
            badge.textContent = getPositionEmoji(position);
            badge.className = `position-badge ${getPositionClass(position)}`;
            input.placeholder = `Nama Pemenang ${position}`;
        });
    }
    
    // Fungsi untuk update preview
    function updatePreview() {
        const entries = winnersContainer.querySelectorAll('.winner-entry');
        const competitionSelect = document.getElementById('competition');
        const selectedCompetition = competitionSelect.value;
        
        if (entries.length === 0 || !selectedCompetition) {
            previewSection.style.display = 'none';
            return;
        }
        
        let previewHTML = `<h4>🏆 ${selectedCompetition}</h4><div class="preview-winners">`;
        
        entries.forEach((entry, index) => {
            const nameInput = entry.querySelector('input[name="winners"]');
            const classSelect = entry.querySelector('select[name="classes"]');
            const position = index + 1;
            const name = nameInput.value || `Pemenang ${position}`;
            const className = classSelect.value || 'Belum dipilih';
            
            previewHTML += `
                <div class="winner-item position-${position}" style="margin-bottom: 10px;">
                    <div class="position">${getPositionEmoji(position)}</div>
                    <div class="winner-info">
                        <div class="winner-name">${name}</div>
                        <div class="winner-class">${className}</div>
                    </div>
                </div>
            `;
        });
        
        previewHTML += '</div>';
        previewContent.innerHTML = previewHTML;
        previewSection.style.display = 'block';
    }
    
    // Event listeners
    addWinnerBtn.addEventListener('click', addWinnerEntry);
    
    clearFormBtn.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data di form?')) {
            winnersContainer.innerHTML = '';
            winnerCount = 0;
            document.getElementById('competition').value = '';
            previewSection.style.display = 'none';
        }
    });
    
    // Event listener untuk perubahan pada form
    winnersForm.addEventListener('input', updatePreview);
    winnersForm.addEventListener('change', updatePreview);
    
    // Event listener untuk submit form
    winnersForm.addEventListener('submit', function(e) {
        const entries = winnersContainer.querySelectorAll('.winner-entry');
        if (entries.length === 0) {
            e.preventDefault();
            alert('Silakan tambahkan minimal satu pemenang!');
            return;
        }
        
        const competitionSelect = document.getElementById('competition');
        if (!competitionSelect.value) {
            e.preventDefault();
            alert('Silakan pilih lomba terlebih dahulu!');
            return;
        }
        
        // Validasi semua input terisi
        let allValid = true;
        entries.forEach(entry => {
            const nameInput = entry.querySelector('input[name="winners"]');
            const classSelect = entry.querySelector('select[name="classes"]');
            
            if (!nameInput.value.trim() || !classSelect.value) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            e.preventDefault();
            alert('Silakan lengkapi semua data pemenang (nama dan kelas)!');
            return;
        }
        
        if (confirm('Apakah Anda yakin ingin menyimpan data pemenang ini?')) {
            // Form akan disubmit
            return true;
        } else {
            e.preventDefault();
        }
    });
    
    // Tambah satu entry pemenang secara default
    addWinnerEntry();
});
