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
    loadFipeBrands();
    setupActiveLinkHighlighting();
    setupAddressSearch();
    setupFormValidation();
    setupAnimations();
    setupFAQ();
    setupQuizForm();
    setupInsuranceTypeSelection();
    setupPlanSelection();
    setupPrivacyConsent();
    setupRecalculate();
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

// Configuração do destaque de link ativo na navbar
function setupActiveLinkHighlighting() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const nav = document.querySelector('nav');
    if (!nav) return;
    const navHeight = nav.offsetHeight;

    const activateLink = (id) => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}` && !link.classList.contains('bg-blue-600')) {
                link.classList.add('active');
            }
        });
    };

    const onScroll = () => {
        const scrollPosition = window.pageYOffset;
        const currentSection = sections.find(section => scrollPosition >= (section.offsetTop - navHeight - 1));
        
        activateLink(currentSection ? currentSection.id : 'home');
    };

    window.addEventListener('scroll', onScroll);
    onScroll(); // Chama uma vez para definir o estado inicial
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

// --- FUNÇÕES DE UI PARA API FIPE ---
function setFipeLoadingState(isLoading) {
    const modeloContainer = document.getElementById('modelo').parentNode;
    const anoContainer = document.getElementById('ano').parentNode;

    [modeloContainer, anoContainer].forEach(container => {
        const label = container.querySelector('label');
        const select = container.querySelector('select');
        label.classList.toggle('skeleton', isLoading);
        select.classList.toggle('skeleton', isLoading);
    });
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
        setFipeLoadingState(true);
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
    } finally {
        setFipeLoadingState(false);
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
        // Apenas o campo de ano precisa do skeleton aqui
        document.getElementById('ano').parentNode.querySelector('label').classList.add('skeleton');
        document.getElementById('ano').classList.add('skeleton');
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
    } finally {
        document.getElementById('ano').parentNode.querySelector('label').classList.remove('skeleton');
        document.getElementById('ano').classList.remove('skeleton');
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
    
    // Valida todos os passos visíveis do quiz antes de submeter
    if (!quizManager.validateAllVisibleSteps()) {
        alert('Por favor, corrija os erros no formulário antes de continuar.');
        return;
    }
    
    // Coletar todos os dados do formulário em um objeto
    const insuranceType = document.querySelector('input[name="insurance-type"]:checked').value;
    const quoteData = {
        insuranceType: insuranceType,
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        nascimento: document.getElementById('nascimento').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        cep: document.getElementById('cep').value,
        // Auto
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano: document.getElementById('ano').value,
        tipoUso: document.getElementById('tipo-uso').value,
        cepPernoite: document.getElementById('cep-pernoite').value,
        // Residencial
        valorImovel: document.getElementById('valor-imovel').value,
        valorConteudo: document.getElementById('valor-conteudo').value,
        areaConstruida: document.getElementById('area-construida').value,
        anoConstrucao: document.getElementById('ano-construcao').value,
        tipoImovel: document.getElementById('tipo-imovel').value,
        finalidadeImovel: document.getElementById('finalidade-imovel').value,
        tipoConstrucao: document.getElementById('tipo-construcao').value,
        coberturas: Array.from(document.querySelectorAll('input[name="coberturas"]:checked')).map(cb => cb.value),
        seguranca: Array.from(document.querySelectorAll('input[name="seguranca"]:checked')).map(cb => cb.value),
        // Vida
        capitalSegurado: document.getElementById('capital-segurado').value,
        profissao: document.getElementById('profissao').value,
        rendaMensal: document.getElementById('renda-mensal').value,
        esportesRadicais: document.getElementById('esportes-radicais').value,
        fumante: document.getElementById('fumante').value,
        doencasGraves: document.getElementById('doencas-graves').value,
    };

    // Mostrar loading
    submitButton.innerHTML = '<div class="loading-spinner"></div>Calculando...';
    submitButton.disabled = true;
    
    // Usamos um pequeno timeout para garantir que o spinner seja renderizado antes do cálculo pesado.
    setTimeout(async () => {
        try {
        let insuranceData;
        const insuranceType = quoteData.insuranceType;

        if (insuranceType === 'auto') {
            const fipeValue = await getFipeValue(quoteData.marca, quoteData.modelo, quoteData.ano);
            if (!fipeValue) throw new Error('Não foi possível obter o valor FIPE do veículo');
            quoteData.fipeValue = fipeValue;
            insuranceData = calculateAutoInsurance(quoteData);
            resultContent.innerHTML = generatePlansHtml(insuranceData.plans);
        } else if (insuranceType === 'residencial') {
            insuranceData = calculateResidentialInsurance(quoteData);
            resultContent.innerHTML = insuranceData.resultHTML;
        } else if (insuranceType === 'vida') {
            insuranceData = calculateLifeInsurance(quoteData);
            resultContent.innerHTML = insuranceData.resultHTML;
        }

        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error('Erro ao calcular cotação:', error);
            alert('Erro ao calcular cotação. Tente novamente ou entre em contato conosco.');
        } finally {
            submitButton.innerHTML = 'Calcular Cotação';
            submitButton.disabled = false;
        }
    }, 100);
}

// Configuração do botão para recalcular
function setupRecalculate() {
    const recalculateBtn = document.getElementById('recalculate-btn');
    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', resetQuoteForm);
    }
}

// Função para resetar o formulário de cotação
function resetQuoteForm() {
    const form = document.getElementById('quote-form');
    const resultDiv = document.getElementById('quote-result');
    const quoteSection = document.getElementById('cotacao');

    // 1. Esconder a seção de resultados
    resultDiv.classList.add('hidden');
    // Restaura a estrutura original da área de resultado, caso tenha sido alterada pela tela de confirmação.
    resultDiv.innerHTML = `
        <div class="text-center">
            <h3 class="text-2xl font-bold text-green-800 mb-4">Cotação Calculada</h3>
            <div id="quote-result-content"></div>
            <p class="text-sm text-green-600 mt-4">Esta é uma estimativa baseada nos dados fornecidos. Nossa equipe entrará em contato para finalizar sua cotação oficial.</p>
            <div class="mt-6">
                <button id="recalculate-btn" type="button" class="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-300"><i class="fas fa-redo-alt mr-2"></i>Calcular Novamente</button>
            </div>
        </div>
    `;

    // 2. Resetar os campos do formulário
    form.reset();

    // 3. Limpar estilos de validação
    form.querySelectorAll('.field-invalid, .field-valid').forEach(field => {
        field.classList.remove('field-invalid', 'field-valid');
    });
    form.querySelectorAll('.error-message').forEach(msg => msg.classList.add('hidden'));

    // Resetar o consentimento e desabilitar o formulário
    const consentCheckbox = document.getElementById('privacy-consent');
    const quoteFieldset = document.getElementById('quote-fieldset');
    if (consentCheckbox) consentCheckbox.checked = false;
    if (quoteFieldset) quoteFieldset.disabled = true;

    // 4. Esconder todas as seções de seguro específicas
    document.querySelectorAll('.insurance-section').forEach(section => {
        section.classList.add('hidden');
    });

    // 5. Atualizar os campos obrigatórios para o estado inicial (nenhum)
    updateRequiredFields(null);

    // 6. Resetar o quiz para o primeiro passo
    quizManager.reset();

    // 7. Rolar a tela de volta para o formulário
    quoteSection.scrollIntoView({ behavior: 'smooth' });
}

// Calcular valor do seguro auto
function calculateAutoInsurance(data) {
    // --- Fatores de Cálculo ---
    // A lógica abaixo é uma SIMULAÇÃO. Em um cenário real, os cálculos seriam feitos por um sistema de backend seguro.
    // Os multiplicadores aumentam ou diminuem o valor base do seguro.

    // Calcular idade do condutor principal
    const birthDate = new Date(data.nascimento);
    const age = new Date().getFullYear() - birthDate.getFullYear();    
    
    // Fator base: Define o ponto de partida do prêmio do seguro.
    let basePercentage = 0.07; // 7% do valor FIPE como base.
    
    // 1. Ajuste por Idade do Condutor
    // Condutores mais jovens tendem a ter um prêmio mais alto devido à percepção de maior risco.
    let ageMultiplier = 1;
    let ageGroup = '';
    if (age < 25) {
        ageMultiplier = 1.4; // +40%
        ageGroup = 'Jovem (maior risco)';
    } else if (age >= 25 && age <= 40) {
        ageMultiplier = 1; // Fator neutro
        ageGroup = 'Adulto (risco médio)';
    } else if (age > 40 && age <= 60) {
        ageMultiplier = 0.9; // -10%
        ageGroup = 'Experiente (menor risco)';
    } else {
        ageMultiplier = 1.1; // +10%
        ageGroup = 'Senior (risco médio-alto)';
    }
    
    // 2. Ajuste por Tipo de Uso do Veículo
    // O uso comercial ou por aplicativo aumenta a exposição ao risco (mais tempo na rua).
    const tipoUso = data.tipoUso;
    let usageMultiplier = 1;
    let usageType = '';
    switch (tipoUso) {
        case 'particular':
            usageMultiplier = 1;
            usageType = 'Uso particular';
            break;
        case 'aplicativo':
            usageMultiplier = 1.6; // +60%
            usageType = 'Aplicativo (maior risco)';
            break;
        case 'empresarial':
            usageMultiplier = 1.3; // +30%
            usageType = 'Empresarial (risco elevado)';
            break;
    }
    
    // 3. Ajuste por Localização (CEP de Pernoite)
    // Simulação baseada no primeiro dígito do CEP para representar diferentes níveis de risco (roubo, furto) por região.
    const cepPernoite = data.cepPernoite.replace(/\D/g, '');
    let locationMultiplier = 1;
    let location = '';
    
    const firstDigit = parseInt(cepPernoite[0]);
    if (firstDigit <= 1) {
        locationMultiplier = 1.3; // +30%
        location = 'Grande São Paulo (alto risco)';
    } else if (firstDigit <= 2) {
        locationMultiplier = 1.2; // +20%
        location = 'Rio de Janeiro (risco elevado)';
    } else if (firstDigit <= 5) {
        locationMultiplier = 1.1; // +10%
        location = 'Capital/Região metropolitana';
    } else {
        locationMultiplier = 0.9; // -10%
        location = 'Interior (menor risco)';
    }
    
    // 4. Ajuste por Idade do Veículo
    // Carros mais antigos podem ter peças mais difíceis de encontrar, mas o valor do veículo é menor.
    const anoVeiculo = parseInt(document.getElementById('ano').options[document.getElementById('ano').selectedIndex]?.text?.split(' ')[0] || new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - anoVeiculo;
    
    let ageVehicleMultiplier = 1;
    let vehicleAgeGroup = '';
    if (vehicleAge <= 3) {
        ageVehicleMultiplier = 1.2; // +20% (peças caras, visado para roubo)
        vehicleAgeGroup = 'Veículo novo (0-3 anos)';
    } else if (vehicleAge <= 8) {
        ageVehicleMultiplier = 1; // Fator neutro
        vehicleAgeGroup = 'Veículo seminovo (4-8 anos)';
    } else if (vehicleAge <= 15) {
        ageVehicleMultiplier = 0.8; // -20%
        vehicleAgeGroup = 'Veículo usado (9-15 anos)';
    } else {
        ageVehicleMultiplier = 0.6; // -40%
        vehicleAgeGroup = 'Veículo antigo (15+ anos)';
    }
    
    // --- Cálculo Final ---
    // Multiplica o percentual base por todos os fatores de ajuste.
    const finalPercentage = basePercentage * ageMultiplier * usageMultiplier * locationMultiplier * ageVehicleMultiplier;
    // Aplica o percentual final sobre o valor FIPE do veículo para obter o prêmio base.
    const premioBase = data.fipeValue * finalPercentage;

    // --- Geração de Planos Realista ---
    // Define custos para coberturas adicionais. Podem ser fixos ou um % do valor do veículo.
    const custosAdicionais = {
        colisaoIncendio: data.fipeValue * 0.015, // 1.5% do valor FIPE
        carroReserva: 120, // Custo fixo
        vidrosFarois: 180, // Custo fixo
        danosMorais: 90, // Custo fixo
    };

    const planoEssencial = {
        name: 'Essencial',
        price: premioBase,
        features: ['Roubo e Furto', 'Assistência 24h', 'Cobertura para Terceiros'],
        isRecommended: false,
    };

    const planoCompleto = {
        name: 'Completo',
        price: premioBase + custosAdicionais.colisaoIncendio + custosAdicionais.carroReserva,
        features: [...planoEssencial.features, 'Colisão e Incêndio', 'Carro Reserva'],
        isRecommended: true,
    };

    const planoPremium = {
        name: 'Premium',
        price: planoCompleto.price + custosAdicionais.vidrosFarois + custosAdicionais.danosMorais,
        features: [...planoCompleto.features, 'Vidros e Faróis', 'Danos Morais'],
        isRecommended: false,
    };

    const plans = [planoEssencial, planoCompleto, planoPremium];

    return { plans };
}

// Calcular valor do seguro residencial
function calculateResidentialInsurance(data) {
    // --- Fatores de Cálculo ---
    // A lógica abaixo é uma SIMULAÇÃO. Em um cenário real, os cálculos seriam feitos por um sistema de backend seguro.

    // Coleta e conversão dos dados do formulário
    const valorImovel = parseFloat(data.valorImovel) || 0;
    const valorConteudo = parseFloat(data.valorConteudo) || 0;
    const anoConstrucao = parseInt(data.anoConstrucao) || new Date().getFullYear();
    const tipoImovel = data.tipoImovel;
    const usoImovel = data.finalidadeImovel;
    const tipoConstrucao = data.tipoConstrucao;
    const sistemasSeguranca = data.seguranca || [];
    const coberturasAdicionais = data.coberturas || [];

    // --- Cálculo do Prêmio Base ---
    // O prêmio inicial é calculado separadamente para a estrutura do imóvel e para o conteúdo.
    const basePercentageStructure = 0.002; // 0.2% do valor de reconstrução do imóvel.
    const basePercentageContent = 0.007;   // 0.7% do valor dos bens/conteúdo.

    // Soma dos valores base para obter o prêmio inicial.
    let premioBase = (valorImovel * basePercentageStructure) + (valorConteudo * basePercentageContent);

    // --- Fatores de Ajuste (Multiplicadores) ---
    // Cada característica do imóvel aplica um multiplicador que aumenta ou diminui o prêmio base.
    let propertyMultiplier = 1, usageMultiplier = 1, constructionMultiplier = 1, ageMultiplier = 1, securityMultiplier = 1;
    let fatoresResumo = []; // Array para armazenar o resumo que será exibido ao usuário.

    // 1. Ajuste por tipo de imóvel (Apartamentos são geralmente mais seguros que casas).
    switch (tipoImovel) {
        case 'casa': propertyMultiplier = 1.2; fatoresResumo.push('Tipo: Casa'); break;
        case 'apartamento': propertyMultiplier = 0.8; fatoresResumo.push('Tipo: Apartamento'); break;
        case 'sobrado': propertyMultiplier = 1.25; fatoresResumo.push('Tipo: Sobrado'); break;
        case 'casa_condominio': propertyMultiplier = 0.9; fatoresResumo.push('Tipo: Casa em Condomínio'); break;
    }

    // 2. Ajuste por uso do imóvel (Imóveis de veraneio ficam vazios por mais tempo, aumentando o risco).
    switch (usoImovel) {
        case 'moradia': usageMultiplier = 1.0; fatoresResumo.push('Uso: Moradia Habitual'); break;
        case 'veraneio': usageMultiplier = 1.5; fatoresResumo.push('Uso: Veraneio (risco maior)'); break;
    }

    // 3. Ajuste por tipo de construção (Madeira tem maior risco de incêndio que alvenaria).
    switch (tipoConstrucao) {
        case 'alvenaria': constructionMultiplier = 1.0; fatoresResumo.push('Construção: Alvenaria'); break;
        case 'madeira': constructionMultiplier = 1.8; fatoresResumo.push('Construção: Madeira (risco de incêndio)'); break;
        case 'mista': constructionMultiplier = 1.4; fatoresResumo.push('Construção: Mista'); break;
    }

    // 4. Ajuste por idade da construção (Imóveis mais antigos podem ter mais problemas estruturais/elétricos).
    const buildingAge = new Date().getFullYear() - anoConstrucao;
    if (buildingAge <= 5) { ageMultiplier = 0.95; fatoresResumo.push('Idade do Imóvel: Novo (0-5 anos)'); }
    else if (buildingAge <= 20) { ageMultiplier = 1.0; fatoresResumo.push('Idade do Imóvel: Recente (6-20 anos)'); }
    else if (buildingAge <= 40) { ageMultiplier = 1.15; fatoresResumo.push('Idade do Imóvel: Antigo (21-40 anos)'); }
    else { ageMultiplier = 1.3; fatoresResumo.push('Idade do Imóvel: Muito Antigo (40+ anos)'); }

    // 5. Ajuste por sistemas de segurança (Aplicam descontos, reduzindo o prêmio).
    let securityFactors = [];
    if (sistemasSeguranca.includes('alarme')) { securityMultiplier *= 0.95; securityFactors.push('Alarme'); } // 5% de desconto
    if (sistemasSeguranca.includes('camera')) { securityMultiplier *= 0.97; securityFactors.push('Câmeras'); } // 3% de desconto
    if (sistemasSeguranca.includes('portaria')) { securityMultiplier *= 0.90; securityFactors.push('Portaria 24h'); } // 10% de desconto
    if (securityFactors.length > 0) {
        fatoresResumo.push(`Segurança: ${securityFactors.join(', ')} (desconto)`);
    } else {
        fatoresResumo.push('Segurança: Nenhum sistema informado');
    }

    // Aplica todos os multiplicadores de risco ao prêmio base.
    let premioAjustado = premioBase * propertyMultiplier * usageMultiplier * constructionMultiplier * ageMultiplier * securityMultiplier;

    // 6. Adicionar custo das coberturas adicionais
    // Cada cobertura opcional tem um custo fixo ou percentual que é somado ao final.
    let custoCoberturasAdicionais = 0;
    let coberturasContratadas = [];
    if (coberturasAdicionais.includes('danos_eletricos')) { custoCoberturasAdicionais += (valorConteudo * 0.0015); coberturasContratadas.push('Danos Elétricos'); }
    if (coberturasAdicionais.includes('vendaval')) { custoCoberturasAdicionais += (valorImovel * 0.0005); coberturasContratadas.push('Vendaval/Granizo'); }
    if (coberturasAdicionais.includes('roubo_furto')) { custoCoberturasAdicionais += (valorConteudo * 0.005); coberturasContratadas.push('Roubo/Furto de Bens'); }
    if (coberturasAdicionais.includes('resp_civil')) { custoCoberturasAdicionais += 50; coberturasContratadas.push('Responsabilidade Civil'); } // Valor fixo
    
    if (coberturasContratadas.length === 0) {
        coberturasContratadas.push('Apenas cobertura básica contra incêndio');
    }

    // --- Cálculo Final ---
    // O valor final é o prêmio ajustado pelos riscos mais o custo das coberturas extras.
    const annualValue = premioAjustado + custoCoberturasAdicionais;
    const monthlyValue = annualValue / 12;
    
    // Montagem do HTML de resultado
    const resultHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-bold text-blue-800 mb-2">Cobertura Total</h4>
                <p class="text-lg font-semibold text-blue-700">Imóvel: ${formatCurrency(valorImovel)}</p>
                <p class="text-lg font-semibold text-blue-700">Conteúdo: ${formatCurrency(valorConteudo)}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-bold text-green-800 mb-2">Estimativa do Seguro Anual</h4>
                <p class="text-2xl font-bold text-green-600">${formatCurrency(annualValue)}</p>
                <p class="text-sm text-green-700 mt-1">Aproximadamente ${formatCurrency(monthlyValue)}/mês</p>
            </div>
        </div>
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-3">Resumo da Cotação:</h4>
            <div class="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                ${fatoresResumo.map(fator => `<div>• ${fator}</div>`).join('')}
            </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-3">Coberturas Incluídas:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
                ${coberturasContratadas.map(cobertura => `<li><i class="fas fa-check-circle text-green-500 mr-2"></i>${cobertura}</li>`).join('')}
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
function calculateLifeInsurance(data) {
    // --- Fatores de Cálculo ---
    // A lógica abaixo é uma SIMULAÇÃO. Em um cenário real, os cálculos seriam feitos por um sistema de backend seguro.

    // Coleta e conversão dos dados do formulário
    const capitalSegurado = parseFloat(data.capitalSegurado) || 0;
    const profissao = data.profissao;
    const rendaMensal = parseFloat(data.rendaMensal) || 0;
    const esportesRadicais = data.esportesRadicais;
    const fumante = data.fumante;    
    const doencasGraves = data.doencasGraves;
    
    // Calcular idade do segurado
    const birthDate = new Date(data.nascimento);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    // Fator base: Define o ponto de partida do prêmio do seguro.
    let basePercentage = 0.008; // 0.8% do capital segurado como base.
    
    // --- Fatores de Ajuste (Multiplicadores) ---
    // Cada característica do segurado aplica um multiplicador que aumenta ou diminui o prêmio base.

    // 1. Ajuste por idade (O risco aumenta significativamente com a idade).
    let ageMultiplier = 1;
    let ageGroup = '';
    if (age < 30) {
        ageMultiplier = 0.7; // -30%
        ageGroup = 'Jovem (18-29 anos) - baixo risco';
    } else if (age >= 30 && age <= 45) {
        ageMultiplier = 1; // Fator neutro
        ageGroup = 'Adulto (30-45 anos) - risco normal';
    } else if (age >= 46 && age <= 60) {
        ageMultiplier = 1.5; // +50%
        ageGroup = 'Meia idade (46-60 anos) - risco elevado';
    } else {
        ageMultiplier = 2.5; // +150%
        ageGroup = 'Senior (60+ anos) - alto risco';
    }
    
    // 2. Ajuste por profissão (Algumas profissões têm maior risco de acidentes).
    let professionMultiplier = 1;
    let professionRisk = '';
    // Listas simplificadas para simulação
    const riskProfessions = ['policial', 'bombeiro', 'piloto', 'minerador', 'soldador', 'segurança'];
    const lowRiskProfessions = ['professor', 'contador', 'advogado', 'médico', 'engenheiro', 'escritório'];
    
    const profissaoLower = profissao.toLowerCase();
    if (riskProfessions.some(prof => profissaoLower.includes(prof))) {
        professionMultiplier = 1.8; // +80%
        professionRisk = 'Profissão de alto risco';
    } else if (lowRiskProfessions.some(prof => profissaoLower.includes(prof))) {
        professionMultiplier = 0.9; // -10%
        professionRisk = 'Profissão de baixo risco';
    } else {
        professionMultiplier = 1; // Fator neutro
        professionRisk = 'Profissão de risco médio';
    }
    
    // 3. Ajuste por hábitos e saúde (Fatores que impactam diretamente a expectativa de vida).
    let habitsMultiplier = 1;
    let habitsInfo = []; // Array para armazenar o resumo que será exibido ao usuário.
    
    if (fumante === 'sim') {
        habitsMultiplier *= 1.5; // +50%
        habitsInfo.push('Fumante (risco aumentado)');
    }
    
    if (esportesRadicais === 'sim') {
        habitsMultiplier *= 1.3;
        habitsInfo.push('Esportes radicais (30% aumento)');
    }
    
    if (doencasGraves === 'sim') {
        habitsMultiplier *= 1.4; // +40%
        habitsInfo.push('Histórico de doenças graves');
    }
    
    if (habitsInfo.length === 0) {
        habitsInfo.push('Sem fatores de risco adicionais');
    }
    
    // --- Cálculo Final ---
    // Multiplica o percentual base por todos os fatores de ajuste.
    const finalPercentage = basePercentage * ageMultiplier * professionMultiplier * habitsMultiplier;
    // Aplica o percentual final sobre o capital segurado.
    const annualValue = capitalSegurado * finalPercentage;
    const monthlyValue = annualValue / 12;
    
    // Montagem do HTML de resultado
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
                <li>• Profissão: ${professionRisk}</li>
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
            
            const isOpening = answer.classList.contains('hidden');

            // Fechar outras perguntas abertas
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    const otherTargetId = otherQuestion.getAttribute('data-target');
                    const otherAnswer = document.getElementById(otherTargetId);
                    const otherIcon = otherQuestion.querySelector('i');

                    otherAnswer.classList.add('hidden');
                    otherIcon.classList.remove('rotate-180');
                }
            });

            // Alterna a visibilidade da resposta e a rotação do ícone
            answer.classList.toggle('hidden');
            icon.classList.toggle('rotate-180', isOpening);
        });
    });
}

// Configuração da seleção de plano
function setupPlanSelection() {
    const resultContent = document.getElementById('quote-result-content');
    if (!resultContent) return;

    resultContent.addEventListener('click', function(e) {
        const button = e.target.closest('.plan-selection-btn');
        const resultDiv = document.getElementById('quote-result');
        if (!button) return;

        const planName = button.dataset.planName;
        const planPrice = parseFloat(button.dataset.planPrice);

        const confirmationHTML = `
            <div class="text-center p-6 bg-white rounded-lg shadow-lg animate-fadeInUp">
                <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800">Ótima escolha!</h3>
                <p class="text-gray-600 mt-2 mb-4">
                    Você selecionou o <strong>Plano ${planName}</strong>. Um de nossos corretores especializados entrará em contato em breve para finalizar os detalhes da sua cotação.
                </p>
                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-lg text-blue-800">Valor aproximado:</p>
                    <p class="text-3xl font-bold text-blue-600">${formatCurrency(planPrice)}<span class="text-base font-normal text-gray-500">/mês</span></p>
                </div>
            </div>
        `;

        // Substitui todo o conteúdo da área de resultado pela mensagem de confirmação
        if (resultDiv) {
            resultDiv.innerHTML = confirmationHTML;
        }
    });
}

// Configuração do consentimento de privacidade
function setupPrivacyConsent() {
    const consentCheckbox = document.getElementById('privacy-consent');
    const quoteFieldset = document.getElementById('quote-fieldset');

    if (!consentCheckbox || !quoteFieldset) return;

    // A fieldset começa desabilitada no HTML.
    // Apenas precisamos lidar com o evento de mudança.
    consentCheckbox.addEventListener('change', function() {
        // Habilita ou desabilita o fieldset baseado no estado do checkbox
        quoteFieldset.disabled = !this.checked;
    });
}

// Gerenciador do estado e lógica do formulário em passos (Quiz)
const quizManager = {
    currentStepIndex: 0,
    form: null,
    nextBtn: null,
    prevBtn: null,
    submitBtn: null,
    progressBar: null,
    allSteps: [],
    
    init() {
        this.form = document.getElementById('quote-form');
        if (!this.form || this.form.dataset.quizInitialized) return;

        this.nextBtn = document.getElementById('next-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.submitBtn = document.getElementById('submit-quote');
        this.progressBar = document.getElementById('progress-bar');
        this.allSteps = Array.from(this.form.querySelectorAll('.form-step'));

        // Adiciona os listeners apenas uma vez
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn.addEventListener('click', () => this.prevStep());

        this.form.dataset.quizInitialized = 'true';
        this.updateView();
    },

    reset() {
        this.currentStepIndex = 0;
        this.updateView();
    },

    getVisibleSteps() {
        const checkedRadio = document.querySelector('input[name="insurance-type"]:checked');
        const insuranceType = checkedRadio ? checkedRadio.value : null;

        return this.allSteps.filter(step => {
            const stepType = step.getAttribute('data-insurance-type');
            // Passo sem tipo específico é sempre considerado na contagem de passos.
            if (!stepType) {
                return true;
            }
            // Passo com tipo específico só é considerado se o tipo correspondente estiver selecionado.
            return stepType === insuranceType;
        });
    },

    updateView() {
        const visibleSteps = this.getVisibleSteps();
        
        // Garante que o índice não seja maior que o número de passos visíveis
        if (this.currentStepIndex >= visibleSteps.length) {
            this.currentStepIndex = visibleSteps.length - 1;
        }
        
        visibleSteps.forEach((step, index) => {
            step.classList.toggle('hidden', index !== this.currentStepIndex);
        });

        const isFirstStep = this.currentStepIndex === 0;
        const isLastStep = this.currentStepIndex === visibleSteps.length - 1;

        this.prevBtn.classList.toggle('hidden', isFirstStep);
        this.nextBtn.classList.toggle('hidden', isLastStep);
        this.submitBtn.classList.toggle('hidden', !isLastStep);

        const progress = ((this.currentStepIndex + 1) / visibleSteps.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    },

    validateCurrentStep() {
        const currentStepDiv = this.getVisibleSteps()[this.currentStepIndex];
        if (!currentStepDiv) return false;

        // Validação especial para o primeiro passo (seleção do tipo de seguro)
        if (this.currentStepIndex === 0) {
            const checkedRadio = this.form.querySelector('input[name="insurance-type"]:checked');
            if (!checkedRadio) {
                // Pode-se usar um toast ou um feedback visual melhor no futuro.
                alert('Por favor, selecione um tipo de seguro para continuar.');
                return false;
            }
        }

        const inputs = currentStepDiv.querySelectorAll('input[required], select[required]');
        let isStepValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isStepValid = false;
            }
        });
        return isStepValid;
    },

    validateAllVisibleSteps() {
        const visibleSteps = this.getVisibleSteps();
        let isFormValid = true;
        visibleSteps.forEach(step => {
            const inputs = step.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                // Verificamos isFormValid aqui para evitar que um campo válido
                // sobrescreva um erro anterior.
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });
        });
        return isFormValid;
    },

    nextStep() {
        if (this.validateCurrentStep()) {
            const visibleSteps = this.getVisibleSteps();
            if (this.currentStepIndex < visibleSteps.length - 1) {
                this.currentStepIndex++;
                this.updateView();
            }
        }
    },

    prevStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.updateView();
        }
    }
};

// Gerar HTML para os planos de comparação
function generatePlansHtml(plans) {
    const allFeatures = [...new Set(plans.flatMap(p => p.features))];

    const plansHtml = plans.map(plan => {
        const isRecommended = plan.isRecommended;
        const monthlyPrice = plan.price / 12;

        return `
            <div class="bg-white p-6 rounded-lg shadow-md border-2 ${isRecommended ? 'border-blue-600' : 'border-transparent'} relative">
                ${isRecommended ? '<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMENDADO</span>' : ''}
                <h4 class="text-xl font-bold ${isRecommended ? 'text-blue-800' : 'text-gray-800'}">${plan.name}</h4>
                <p class="text-3xl font-bold text-gray-900 my-4">${formatCurrency(monthlyPrice)}<span class="text-base font-normal text-gray-500">/mês</span></p>
                <p class="text-xs text-gray-500 mb-4">Valor anual: ${formatCurrency(plan.price)}</p>
                <ul class="space-y-2 text-gray-600 mb-6">
                    ${allFeatures.map(feature => {
                        const hasFeature = plan.features.includes(feature);
                        return `
                            <li class="flex items-center ${hasFeature ? '' : 'text-gray-400 line-through'}">
                                <i class="fas ${hasFeature ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-400'} mr-2"></i>
                                ${feature}
                            </li>
                        `;
                    }).join('')}
                </ul>
                <button class="w-full ${isRecommended ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} py-2 rounded-lg font-semibold plan-selection-btn" data-plan-name="${plan.name}" data-plan-price="${monthlyPrice}">Selecionar Plano</button>
            </div>
        `;
    }).join('');

    return `<div class="grid md:grid-cols-3 gap-6 text-left">${plansHtml}</div>`;
}

// Configuração do formulário em passos (Quiz)
function setupQuizForm() {
    quizManager.init();
}

// Configuração da seleção do tipo de seguro
function setupInsuranceTypeSelection() {
    const insuranceTypeRadios = document.querySelectorAll('.insurance-type-radio');
    const insuranceSections = document.querySelectorAll('.insurance-section');
    
    // Ao carregar, nenhum tipo está selecionado, então nenhum campo específico é obrigatório.
    updateRequiredFields(null);
    
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

            // Avisa o quiz manager para recalcular os passos visíveis e atualizar a UI
            if (quizManager) {
                quizManager.updateView();
            }
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

    // Se nenhum tipo de seguro for selecionado, não há nada a fazer.
    if (!insuranceType) {
        return;
    }
    
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
            'residencial': ['tipo-imovel', 'finalidade-imovel', 'tipo-construcao', 'ano-construcao', 'area-construida', 'valor-imovel', 'valor-conteudo'],
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
