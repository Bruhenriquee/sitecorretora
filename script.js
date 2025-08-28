// SeguroMax - Script principal
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Inicialização da aplicação
function initializeApp() {
    setupMobileMenu();
    setupSmoothScrolling();
    setupFormHandlers();
    setupCarousel();
    setupNavbarScroll();
    loadFipeBrands();
    setupAddressSearch();
    setupFormValidation();
    setupAnimations();
    setupFAQ();
    setupInsuranceTypeSelection();
}

// Configuração do menu mobile
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });

    // Fechar menu ao clicar em um link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Configuração do scroll suave
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Configuração da navbar no scroll
function setupNavbarScroll() {
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// Configuração do carrossel
function setupCarousel() {
    const carousel = document.getElementById('insurance-carousel');
    const originalContent = carousel.innerHTML;
    
    // Duplicar conteúdo para scroll infinito
    carousel.innerHTML = originalContent + originalContent;
}




// Configuração dos formulários
function setupFormHandlers() {
    const quoteForm = document.getElementById('quote-form');
    const contactForm = document.getElementById('contact-form');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmission);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
}

// Busca de endereço por CEP
function setupAddressSearch() {
    const cepField = document.getElementById('cep');
    const cepPernoiteField = document.getElementById('cep-pernoite');
    
    if (cepField) {
        cepField.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                searchAddress(cep, false);
            }
        });
    }
    
    if (cepPernoiteField) {
        cepPernoiteField.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                validateCep(cep);
            }
        });
    }
}

// Buscar endereço via API
async function searchAddress(cep, isPernoite = false) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            if (!isPernoite) {
                document.getElementById('rua').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            }
        } else {
            showFieldError('cep', 'CEP não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

// Validar CEP
async function validateCep(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            showFieldError('cep-pernoite', 'CEP inválido');
            return false;
        }
        
        clearFieldError('cep-pernoite');
        return true;
    } catch (error) {
        showFieldError('cep-pernoite', 'Erro ao validar CEP');
        return false;
    }
}

// Carregar marcas da FIPE
async function loadFipeBrands() {
    const marcaSelect = document.getElementById('marca');
    
    if (!marcaSelect) return;
    
    try {
        marcaSelect.innerHTML = '<option value="">Carregando marcas...</option>';
        
        const response = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');
        const brands = await response.json();
        
        marcaSelect.innerHTML = '<option value="">Selecione a marca</option>';
        
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.codigo;
            option.textContent = brand.nome;
            marcaSelect.appendChild(option);
        });
        
        marcaSelect.addEventListener('change', function() {
            loadFipeModels(this.value);
        });
        
    } catch (error) {
        console.error('Erro ao carregar marcas FIPE:', error);
        marcaSelect.innerHTML = '<option value="">Erro ao carregar marcas</option>';
    }
}

// Carregar modelos da FIPE
async function loadFipeModels(brandCode) {
    const modeloSelect = document.getElementById('modelo');
    const anoSelect = document.getElementById('ano');
    
    if (!brandCode) {
        modeloSelect.innerHTML = '<option value="">Selecione a marca primeiro</option>';
        modeloSelect.disabled = true;
        anoSelect.innerHTML = '<option value="">Selecione o modelo primeiro</option>';
        anoSelect.disabled = true;
        return;
    }
    
    try {
        modeloSelect.innerHTML = '<option value="">Carregando modelos...</option>';
        modeloSelect.disabled = false;
        
        const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`);
        const data = await response.json();
        
        modeloSelect.innerHTML = '<option value="">Selecione o modelo</option>';
        
        data.modelos.forEach(model => {
            const option = document.createElement('option');
            option.value = model.codigo;
            option.textContent = model.nome;
            modeloSelect.appendChild(option);
        });
        
        modeloSelect.addEventListener('change', function() {
            loadFipeYears(brandCode, this.value);
        });
        
    } catch (error) {
        console.error('Erro ao carregar modelos FIPE:', error);
        modeloSelect.innerHTML = '<option value="">Erro ao carregar modelos</option>';
    }
}

// Carregar anos da FIPE
async function loadFipeYears(brandCode, modelCode) {
    const anoSelect = document.getElementById('ano');
    
    if (!modelCode) {
        anoSelect.innerHTML = '<option value="">Selecione o modelo primeiro</option>';
        anoSelect.disabled = true;
        return;
    }
    
    try {
        anoSelect.innerHTML = '<option value="">Carregando anos...</option>';
        anoSelect.disabled = false;
        
        const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);
        const years = await response.json();
        
        anoSelect.innerHTML = '<option value="">Selecione o ano</option>';
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year.codigo;
            option.textContent = year.nome;
            anoSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar anos FIPE:', error);
        anoSelect.innerHTML = '<option value="">Erro ao carregar anos</option>';
    }
}

// Buscar valor FIPE
async function getFipeValue(brandCode, modelCode, yearCode) {
    try {
        const response = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
        const data = await response.json();
        
        if (data.Valor) {
            // Remover "R$ " e converter para número
            const valueStr = data.Valor.replace('R$ ', '').replace('.', '').replace(',', '.');
            return parseFloat(valueStr);
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao buscar valor FIPE:', error);
        return null;
    }
}

// Configuração da validação de formulários
function setupFormValidation() {
    // Máscaras de input
    setupInputMasks();
    
    // Validação em tempo real
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input.id));
    });
}

// Configurar máscaras de input
function setupInputMasks() {
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const cepPernoiteInput = document.getElementById('cep-pernoite');
    const placaInput = document.getElementById('placa');
    
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            this.value = maskCPF(this.value);
        });
    }
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            this.value = maskPhone(this.value);
        });
    }
    
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            this.value = maskCEP(this.value);
        });
    }
    
    if (cepPernoiteInput) {
        cepPernoiteInput.addEventListener('input', function() {
            this.value = maskCEP(this.value);
        });
    }
    
    if (placaInput) {
        placaInput.addEventListener('input', function() {
            this.value = maskPlate(this.value);
        });
    }
}

// Máscara para CPF
function maskCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

// Máscara para telefone
function maskPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

// Máscara para CEP
function maskCEP(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
}

// Máscara para placa
function maskPlate(value) {
    return value
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/(\w{3})(\w)/, '$1-$2')
        .replace(/(-\w{4})\w+?$/, '$1')
        .toUpperCase();
}

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    
    switch (fieldId) {
        case 'nome':
            return validateName(value, fieldId);
        case 'cpf':
            return validateCPF(value, fieldId);
        case 'nascimento':
            return validateBirthDate(value, fieldId);
        case 'telefone':
            return validatePhone(value, fieldId);
        case 'email':
            return validateEmail(value, fieldId);
        case 'cep':
        case 'cep-pernoite':
            return validateCEP(value, fieldId);
        case 'chassi':
            return validateChassi(value, fieldId);
        default:
            return validateRequired(value, fieldId);
    }
}

// Validação de nome
function validateName(value, fieldId) {
    if (!value) {
        showFieldError(fieldId, 'Nome é obrigatório');
        return false;
    }
    
    if (value.length < 3) {
        showFieldError(fieldId, 'Nome deve ter pelo menos 3 caracteres');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Validação de CPF
function validateCPF(value, fieldId) {
    const cpf = value.replace(/\D/g, '');
    
    if (!cpf) {
        showFieldError(fieldId, 'CPF é obrigatório');
        return false;
    }
    
    if (cpf.length !== 11) {
        showFieldError(fieldId, 'CPF deve ter 11 dígitos');
        return false;
    }
    
    // Validação básica de CPF
    if (!isValidCPF(cpf)) {
        showFieldError(fieldId, 'CPF inválido');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Verificar se CPF é válido
function isValidCPF(cpf) {
    // Eliminar CPFs conhecidos como inválidos
    if (cpf === "00000000000" || 
        cpf === "11111111111" || 
        cpf === "22222222222" || 
        cpf === "33333333333" || 
        cpf === "44444444444" || 
        cpf === "55555555555" || 
        cpf === "66666666666" || 
        cpf === "77777777777" || 
        cpf === "88888888888" || 
        cpf === "99999999999") {
        return false;
    }
    
    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validação de data de nascimento
function validateBirthDate(value, fieldId) {
    if (!value) {
        showFieldError(fieldId, 'Data de nascimento é obrigatória');
        return false;
    }
    
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        showFieldError(fieldId, 'É necessário ser maior de 18 anos');
        return false;
    }
    
    if (age > 100) {
        showFieldError(fieldId, 'Data de nascimento inválida');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Validação de telefone
function validatePhone(value, fieldId) {
    const phone = value.replace(/\D/g, '');
    
    if (!phone) {
        showFieldError(fieldId, 'Telefone é obrigatório');
        return false;
    }
    
    if (phone.length !== 11) {
        showFieldError(fieldId, 'Telefone deve ter 11 dígitos');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Validação de email
function validateEmail(value, fieldId) {
    if (!value) {
        showFieldError(fieldId, 'E-mail é obrigatório');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showFieldError(fieldId, 'E-mail inválido');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Validação de CEP
function validateCEP(value, fieldId) {
    const cep = value.replace(/\D/g, '');
    
    if (!cep) {
        showFieldError(fieldId, 'CEP é obrigatório');
        return false;
    }
    
    if (cep.length !== 8) {
        showFieldError(fieldId, 'CEP deve ter 8 dígitos');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Validação de chassi
function validateChassi(value, fieldId) {
    if (!value) {
        showFieldError(fieldId, 'Chassi é obrigatório');
        return false;
    }
    
    if (value.length !== 17) {
        showFieldError(fieldId, 'Chassi deve ter 17 caracteres');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Validação de campo obrigatório
function validateRequired(value, fieldId) {
    if (!value) {
        const field = document.getElementById(fieldId);
        const label = field.previousElementSibling.textContent.replace(' *', '');
        showFieldError(fieldId, `${label} é obrigatório`);
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

// Mostrar erro no campo
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.parentNode.querySelector('.error-message');
    
    field.classList.add('field-invalid');
    field.classList.remove('field-valid');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Limpar erro do campo
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.parentNode.querySelector('.error-message');
    
    field.classList.remove('field-invalid');
    field.classList.add('field-valid');
    
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Submissão do formulário de cotação
async function handleQuoteSubmission(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submit-quote');
    const resultDiv = document.getElementById('quote-result');
    const resultContent = document.getElementById('quote-result-content');
    
    // Validar todos os campos
    const form = e.target;
    const formData = new FormData(form);
    let isValid = true;
    
    // Obter tipo de seguro selecionado
    const insuranceType = document.querySelector('input[name="insurance-type"]:checked').value;
    
    // Validar campos obrigatórios baseados no tipo de seguro
    const commonFields = ['nome', 'cpf', 'nascimento', 'telefone', 'email', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    let specificFields = [];
    
    if (insuranceType === 'auto') {
        specificFields = ['marca', 'modelo', 'ano', 'chassi', 'cep-pernoite', 'tipo-uso'];
    } else if (insuranceType === 'residencial') {
        specificFields = ['tipo-imovel', 'area-construida', 'valor-imovel', 'ano-construcao', 'finalidade-imovel'];
    } else if (insuranceType === 'vida') {
        specificFields = ['capital-segurado', 'profissao', 'renda-mensal'];
    }
    
    const requiredFields = [...commonFields, ...specificFields];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Por favor, corrija os erros no formulário antes de continuar.');
        return;
    }
    
    // Mostrar loading
    submitButton.innerHTML = '<div class="loading-spinner"></div>Calculando...';
    submitButton.disabled = true;
    
    try {
        let insuranceData;
        
        if (insuranceType === 'auto') {
            // Obter valor FIPE
            const marca = document.getElementById('marca').value;
            const modelo = document.getElementById('modelo').value;
            const ano = document.getElementById('ano').value;
            
            const fipeValue = await getFipeValue(marca, modelo, ano);
            
            if (!fipeValue) {
                throw new Error('Não foi possível obter o valor FIPE do veículo');
            }
            
            insuranceData = calculateAutoInsurance(fipeValue, form);
            
        } else if (insuranceType === 'residencial') {
            insuranceData = calculateResidentialInsurance(form);
            
        } else if (insuranceType === 'vida') {
            insuranceData = calculateLifeInsurance(form);
        }
        
        // Mostrar resultado
        resultContent.innerHTML = insuranceData.resultHTML;
        
        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } catch (error) {
        console.error('Erro ao calcular cotação:', error);
        alert('Erro ao calcular cotação. Tente novamente ou entre em contato conosco.');
    } finally {
        submitButton.innerHTML = 'Calcular Cotação';
        submitButton.disabled = false;
    }
}

// Calcular valor do seguro auto
function calculateAutoInsurance(fipeValue, form) {
    const formData = new FormData(form);
    
    // Calcular idade
    const birthDate = new Date(formData.get('nascimento') || document.getElementById('nascimento').value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    // Fatores de cálculo
    let basePercentage = 0.07; // 7% base
    
    // Ajuste por idade
    let ageMultiplier = 1;
    let ageGroup = '';
    if (age < 25) {
        ageMultiplier = 1.4;
        ageGroup = 'Jovem (maior risco)';
    } else if (age >= 25 && age <= 40) {
        ageMultiplier = 1;
        ageGroup = 'Adulto (risco médio)';
    } else if (age > 40 && age <= 60) {
        ageMultiplier = 0.9;
        ageGroup = 'Experiente (menor risco)';
    } else {
        ageMultiplier = 1.1;
        ageGroup = 'Senior (risco médio-alto)';
    }
    
    // Ajuste por tipo de uso
    const tipoUso = formData.get('tipo-uso') || document.getElementById('tipo-uso').value;
    let usageMultiplier = 1;
    let usageType = '';
    switch (tipoUso) {
        case 'particular':
            usageMultiplier = 1;
            usageType = 'Uso particular';
            break;
        case 'aplicativo':
            usageMultiplier = 1.6;
            usageType = 'Aplicativo (maior risco)';
            break;
        case 'empresarial':
            usageMultiplier = 1.3;
            usageType = 'Empresarial (risco elevado)';
            break;
    }
    
    // Ajuste por CEP (simulado baseado na região)
    const cepPernoite = (formData.get('cep-pernoite') || document.getElementById('cep-pernoite').value).replace(/\D/g, '');
    let locationMultiplier = 1;
    let location = '';
    
    const firstDigit = parseInt(cepPernoite[0]);
    if (firstDigit <= 1) {
        locationMultiplier = 1.3; // São Paulo - maior risco
        location = 'Grande São Paulo (alto risco)';
    } else if (firstDigit <= 2) {
        locationMultiplier = 1.2; // Rio de Janeiro
        location = 'Rio de Janeiro (risco elevado)';
    } else if (firstDigit <= 5) {
        locationMultiplier = 1.1; // Outras capitais
        location = 'Capital/Região metropolitana';
    } else {
        locationMultiplier = 0.9; // Interior
        location = 'Interior (menor risco)';
    }
    
    // Ajuste por ano do veículo
    const anoVeiculo = parseInt((formData.get('ano') || document.getElementById('ano').options[document.getElementById('ano').selectedIndex]?.text)?.split(' ')[0] || new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - anoVeiculo;
    
    let ageVehicleMultiplier = 1;
    let vehicleAgeGroup = '';
    if (vehicleAge <= 3) {
        ageVehicleMultiplier = 1.2; // Carro novo - valor alto
        vehicleAgeGroup = 'Veículo novo (0-3 anos)';
    } else if (vehicleAge <= 8) {
        ageVehicleMultiplier = 1; // Seminovo
        vehicleAgeGroup = 'Veículo seminovo (4-8 anos)';
    } else if (vehicleAge <= 15) {
        ageVehicleMultiplier = 0.8; // Usado
        vehicleAgeGroup = 'Veículo usado (9-15 anos)';
    } else {
        ageVehicleMultiplier = 0.6; // Muito antigo
        vehicleAgeGroup = 'Veículo antigo (15+ anos)';
    }
    
    // Cálculo final
    const finalPercentage = basePercentage * ageMultiplier * usageMultiplier * locationMultiplier * ageVehicleMultiplier;
    const annualValue = fipeValue * finalPercentage;
    const monthlyValue = annualValue / 12;
    
    const resultHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-bold text-blue-800 mb-2">Valor FIPE do Veículo</h4>
                <p class="text-2xl font-bold text-blue-600">R$ ${fipeValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-bold text-green-800 mb-2">Estimativa do Seguro Anual</h4>
                <p class="text-2xl font-bold text-green-600">R$ ${annualValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p class="text-sm text-green-700 mt-1">Aproximadamente R$ ${monthlyValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
            </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-2">Fatores Considerados no Cálculo:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
                <li>• Valor FIPE do veículo: R$ ${fipeValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
                <li>• Idade do condutor: ${ageGroup}</li>
                <li>• Tipo de uso: ${usageType}</li>
                <li>• CEP de pernoite: ${location}</li>
                <li>• Ano do veículo: ${vehicleAgeGroup}</li>
            </ul>
        </div>
    `;
    
    return {
        resultHTML,
        annualValue,
        monthlyValue,
        ageGroup,
        usageType,
        location,
        vehicleAge: vehicleAgeGroup
    };
}

// Calcular valor do seguro residencial
function calculateResidentialInsurance(form) {
    const formData = new FormData(form);
    
    // Obter dados do imóvel
    const valorImovel = parseFloat(document.getElementById('valor-imovel').value);
    const areaConstructa = parseFloat(document.getElementById('area-construida').value);
    const anoConstructo = parseInt(document.getElementById('ano-construcao').value);
    const tipoImovel = document.getElementById('tipo-imovel').value;
    const finalidadeImovel = document.getElementById('finalidade-imovel').value;
    const possuiPortaria = document.getElementById('portaria').value;
    
    // Cálculo base: 0.3% a 0.8% do valor do imóvel
    let basePercentage = 0.005; // 0.5% base
    
    // Ajuste por tipo de imóvel
    let propertyMultiplier = 1;
    let propertyType = '';
    switch (tipoImovel) {
        case 'casa':
            propertyMultiplier = 1.1;
            propertyType = 'Casa (risco médio-alto)';
            break;
        case 'apartamento':
            propertyMultiplier = 0.9;
            propertyType = 'Apartamento (menor risco)';
            break;
        case 'sobrado':
            propertyMultiplier = 1.2;
            propertyType = 'Sobrado (maior risco)';
            break;
        case 'kitnet':
            propertyMultiplier = 0.8;
            propertyType = 'Kitnet (baixo risco)';
            break;
        case 'cobertura':
            propertyMultiplier = 1.3;
            propertyType = 'Cobertura (alto risco)';
            break;
    }
    
    // Ajuste por finalidade
    let purposeMultiplier = 1;
    let purposeType = '';
    switch (finalidadeImovel) {
        case 'residencial':
            purposeMultiplier = 1;
            purposeType = 'Residencial';
            break;
        case 'aluguel':
            purposeMultiplier = 1.2;
            purposeType = 'Aluguel (maior risco)';
            break;
        case 'temporada':
            purposeMultiplier = 1.4;
            purposeType = 'Temporada (alto risco)';
            break;
        case 'comercial':
            purposeMultiplier = 1.5;
            purposeType = 'Comercial (alto risco)';
            break;
    }
    
    // Ajuste por idade da construção
    const currentYear = new Date().getFullYear();
    const buildingAge = currentYear - anoConstructo;
    let ageMultiplier = 1;
    let ageGroup = '';
    
    if (buildingAge <= 5) {
        ageMultiplier = 0.9;
        ageGroup = 'Construção nova (0-5 anos)';
    } else if (buildingAge <= 15) {
        ageMultiplier = 1;
        ageGroup = 'Construção recente (6-15 anos)';
    } else if (buildingAge <= 30) {
        ageMultiplier = 1.1;
        ageGroup = 'Construção antiga (16-30 anos)';
    } else {
        ageMultiplier = 1.3;
        ageGroup = 'Construção muito antiga (30+ anos)';
    }
    
    // Ajuste por segurança
    let securityMultiplier = 1;
    let securityType = '';
    if (possuiPortaria === 'sim') {
        securityMultiplier = 0.85;
        securityType = 'Com portaria 24h (desconto)';
    } else {
        securityMultiplier = 1;
        securityType = 'Sem portaria 24h';
    }
    
    // Cálculo final
    const finalPercentage = basePercentage * propertyMultiplier * purposeMultiplier * ageMultiplier * securityMultiplier;
    const annualValue = valorImovel * finalPercentage;
    const monthlyValue = annualValue / 12;
    
    const resultHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-bold text-blue-800 mb-2">Valor do Imóvel</h4>
                <p class="text-2xl font-bold text-blue-600">R$ ${valorImovel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-bold text-green-800 mb-2">Estimativa do Seguro Anual</h4>
                <p class="text-2xl font-bold text-green-600">R$ ${annualValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p class="text-sm text-green-700 mt-1">Aproximadamente R$ ${monthlyValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
            </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-2">Fatores Considerados no Cálculo:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
                <li>• Valor do imóvel: R$ ${valorImovel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
                <li>• Área construída: ${areaConstructa}m²</li>
                <li>• Tipo: ${propertyType}</li>
                <li>• Finalidade: ${purposeType}</li>
                <li>• Idade da construção: ${ageGroup}</li>
                <li>• Segurança: ${securityType}</li>
            </ul>
        </div>
    `;
    
    return {
        resultHTML,
        annualValue,
        monthlyValue
    };
}

// Calcular valor do seguro de vida
function calculateLifeInsurance(form) {
    const formData = new FormData(form);
    
    // Obter dados do segurado
    const capitalSegurado = parseFloat(document.getElementById('capital-segurado').value);
    const profissao = document.getElementById('profissao').value;
    const rendaMensal = parseFloat(document.getElementById('renda-mensal').value);
    const esportesRadicais = document.getElementById('esportes-radicais').value;
    const fumante = document.getElementById('fumante').value;
    const doencasGraves = document.getElementById('doencas-graves').value;
    
    // Calcular idade
    const birthDate = new Date(document.getElementById('nascimento').value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    // Cálculo base: 0.5% a 2% do capital segurado por ano
    let basePercentage = 0.008; // 0.8% base
    
    // Ajuste por idade
    let ageMultiplier = 1;
    let ageGroup = '';
    if (age < 30) {
        ageMultiplier = 0.7;
        ageGroup = 'Jovem (18-29 anos) - baixo risco';
    } else if (age >= 30 && age <= 45) {
        ageMultiplier = 1;
        ageGroup = 'Adulto (30-45 anos) - risco normal';
    } else if (age >= 46 && age <= 60) {
        ageMultiplier = 1.5;
        ageGroup = 'Meia idade (46-60 anos) - risco elevado';
    } else {
        ageMultiplier = 2.5;
        ageGroup = 'Senior (60+ anos) - alto risco';
    }
    
    // Ajuste por profissão (simplificado)
    let professionMultiplier = 1;
    let professionRisk = '';
    const riskProfessions = ['policial', 'bombeiro', 'piloto', 'minerador', 'soldador'];
    const lowRiskProfessions = ['professor', 'contador', 'advogado', 'médico', 'engenheiro'];
    
    const profissaoLower = profissao.toLowerCase();
    if (riskProfessions.some(prof => profissaoLower.includes(prof))) {
        professionMultiplier = 1.8;
        professionRisk = 'Profissão de alto risco';
    } else if (lowRiskProfessions.some(prof => profissaoLower.includes(prof))) {
        professionMultiplier = 0.9;
        professionRisk = 'Profissão de baixo risco';
    } else {
        professionMultiplier = 1;
        professionRisk = 'Profissão de risco médio';
    }
    
    // Ajuste por hábitos
    let habitsMultiplier = 1;
    let habitsInfo = [];
    
    if (fumante === 'sim') {
        habitsMultiplier *= 1.5;
        habitsInfo.push('Fumante (50% aumento)');
    }
    
    if (esportesRadicais === 'sim') {
        habitsMultiplier *= 1.3;
        habitsInfo.push('Esportes radicais (30% aumento)');
    }
    
    if (doencasGraves === 'sim') {
        habitsMultiplier *= 1.4;
        habitsInfo.push('Histórico de doenças (40% aumento)');
    }
    
    if (habitsInfo.length === 0) {
        habitsInfo.push('Sem fatores de risco adicionais');
    }
    
    // Cálculo final
    const finalPercentage = basePercentage * ageMultiplier * professionMultiplier * habitsMultiplier;
    const annualValue = capitalSegurado * finalPercentage;
    const monthlyValue = annualValue / 12;
    
    const resultHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-bold text-blue-800 mb-2">Capital Segurado</h4>
                <p class="text-2xl font-bold text-blue-600">R$ ${capitalSegurado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-bold text-green-800 mb-2">Prêmio Anual Estimado</h4>
                <p class="text-2xl font-bold text-green-600">R$ ${annualValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p class="text-sm text-green-700 mt-1">Aproximadamente R$ ${monthlyValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
            </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-2">Fatores Considerados no Cálculo:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
                <li>• Capital segurado: R$ ${capitalSegurado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
                <li>• Idade: ${ageGroup}</li>
                <li>• Profissão: ${profissionRisk}</li>
                <li>• Hábitos e saúde: ${habitsInfo.join(', ')}</li>
                <li>• Renda mensal: R$ ${rendaMensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
            </ul>
        </div>
    `;
    
    return {
        resultHTML,
        annualValue,
        monthlyValue
    };
}

// Submissão do formulário de contato
async function handleContactSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const successDiv = document.getElementById('contact-success');
    
    // Simular envio (em produção, enviar para servidor)
    setTimeout(() => {
        form.reset();
        successDiv.classList.remove('hidden');
        
        setTimeout(() => {
            successDiv.classList.add('hidden');
        }, 5000);
    }, 1000);
}

// Configuração das animações
function setupAnimations() {
    // Observer para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar seções para animação
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Utilitários gerais
function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner"></div>Carregando...';
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

// Configuração do FAQ
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const answer = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            // Fechar outras perguntas abertas
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    const otherTargetId = otherQuestion.getAttribute('data-target');
                    const otherAnswer = document.getElementById(otherTargetId);
                    const otherIcon = otherQuestion.querySelector('i');
                    
                    otherAnswer.classList.add('hidden');
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle da pergunta atual
            if (answer.classList.contains('hidden')) {
                answer.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            } else {
                answer.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
}

// Configuração da seleção do tipo de seguro
function setupInsuranceTypeSelection() {
    const insuranceTypeRadios = document.querySelectorAll('.insurance-type-radio');
    const insuranceSections = document.querySelectorAll('.insurance-section');
    
    // Configurar campos obrigatórios iniciais (seguro auto é padrão)
    updateRequiredFields('auto');
    
    insuranceTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const selectedType = this.value;
            
            // Esconder todas as seções
            insuranceSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Mostrar a seção correspondente
            const targetSection = document.getElementById(selectedType + '-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
            
            // Atualizar campos obrigatórios
            updateRequiredFields(selectedType);
        });
    });
}

// Atualizar campos obrigatórios baseado no tipo de seguro
function updateRequiredFields(insuranceType) {
    // Remover required de todos os campos específicos
    const allSpecificFields = document.querySelectorAll('#auto-section input, #auto-section select, #residencial-section input, #residencial-section select, #vida-section input, #vida-section select');
    allSpecificFields.forEach(field => {
        field.removeAttribute('required');
    });
    
    // Adicionar required apenas aos campos da seção ativa
    let activeSection = null;
    if (insuranceType === 'auto') {
        activeSection = document.getElementById('auto-section');
    } else if (insuranceType === 'residencial') {
        activeSection = document.getElementById('residencial-section');
    } else if (insuranceType === 'vida') {
        activeSection = document.getElementById('vida-section');
    }
    
    if (activeSection) {
        // Campos que sempre são obrigatórios para cada tipo (baseado nos asteriscos)
        const requiredFieldIds = {
            'auto': ['marca', 'modelo', 'ano', 'chassi', 'cep-pernoite', 'tipo-uso'],
            'residencial': ['tipo-imovel', 'area-construida', 'valor-imovel', 'ano-construcao', 'finalidade-imovel'],
            'vida': ['capital-segurado', 'profissao', 'renda-mensal']
        };
        
        const fieldsToMakeRequired = requiredFieldIds[insuranceType] || [];
        fieldsToMakeRequired.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', 'required');
            }
        });
    }
}

// Logs para debug (remover em produção)
console.log('SeguroMax - Sistema carregado com sucesso!');
