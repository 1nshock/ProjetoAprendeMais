function showForm(type) {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('form-' + type).classList.add('active');
}

function showMenu() {
    document.getElementById('menu').classList.remove('hidden');

    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => {
        form.classList.remove('active');
    });
}

function handleSubmit(event, type) {
    event.preventDefault();
    alert('Cadastro de ' + type + ' realizado com sucesso!');
    showMenu();
    event.target.reset();
}

document.addEventListener('input', function (e) {
    if (e.target.placeholder === '000.000.000-00') {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    }

    if (e.target.placeholder === '00.000.000/0000-00') {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1/$2');
        value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    }

    if (e.target.placeholder === '00000-000') {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    }

    if (e.target.type === 'tel') {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    }
});