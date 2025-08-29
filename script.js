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
    setupScrollAnimations();
    setupNumberCounters();
    setupActiveLinkHighlighting();
    setupAddressSearch();
    setupFormValidation();
    setupAnimations();
    setupFAQ();
    setupQuizForm();
    setupInsuranceTypeSelection();
    setupPlanSelection();
    loadFipeBrands();
    setupPrivacyConsent();
    loadFormDataFromLocalStorage(); // Carrega dados salvos
    setupRecalculate();
    setupModal();
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
        input.addEventListener('change', saveFormDataToLocalStorage); // Salva a cada mudança
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
        genero: document.getElementById('genero').value,
        estadoCivil: document.getElementById('estado-civil').value,
        cep: document.getElementById('cep').value,
        // Auto
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano: document.getElementById('ano').value,
        tipoUso: document.getElementById('tipo-uso').value,
        cepPernoite: document.getElementById('cep-pernoite').value,
        classeBonus: document.getElementById('classe-bonus').value,
        garagemCasa: document.getElementById('garagem-casa').value,
        garagemTrabalho: document.getElementById('garagem-trabalho').value,
        // Residencial
        valorImovel: document.getElementById('valor-imovel').value,
        valorConteudo: document.getElementById('valor-conteudo').value,
        areaConstruida: document.getElementById('area-construida').value,
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
            let submissionPayload; // Objeto para enviar ao Formspree
            const insuranceType = quoteData.insuranceType;

            if (insuranceType === 'auto') {
                const fipeValue = await getFipeValue(quoteData.marca, quoteData.modelo, quoteData.ano);
                if (!fipeValue) throw new Error('Não foi possível obter o valor FIPE do veículo');
                quoteData.fipeValue = fipeValue;
                insuranceData = calculateAutoInsurance(quoteData);
                resultContent.innerHTML = generatePlansHtml(insuranceData.plans, insuranceData.factors);

                // Prepara os dados para o e-mail
                const recommendedPlan = insuranceData.plans.find(p => p.isRecommended) || insuranceData.plans[1];
                submissionPayload = {
                    _subject: `Cotação Seguro AUTO - ${quoteData.nome}`,
                    'Tipo de Seguro': 'Automóvel',
                    ...getCommonDataForEmail(quoteData),
                    'Veículo': `${document.getElementById('marca').options[document.getElementById('marca').selectedIndex].text} ${document.getElementById('modelo').options[document.getElementById('modelo').selectedIndex].text} ${document.getElementById('ano').options[document.getElementById('ano').selectedIndex].text}`,
                    'Valor FIPE': formatCurrency(quoteData.fipeValue),
                    'Uso': quoteData.tipoUso,
                    'CEP Pernoite': quoteData.cepPernoite,
                    'Classe de Bônus': quoteData.classeBonus,
                    'Garagem': `Casa: ${quoteData.garagemCasa}, Trabalho: ${quoteData.garagemTrabalho}`,
                    '--- PLANO RECOMENDADO ---': '---',
                    'Plano Recomendado': recommendedPlan.name,
                    'Valor Mensal (Plano Recomendado)': formatCurrency(recommendedPlan.price / 12),
                    'Valor Anual (Plano Recomendado)': formatCurrency(recommendedPlan.price),
                };

            } else if (insuranceType === 'residencial') {
                insuranceData = calculateResidentialInsurance(quoteData);
                resultContent.innerHTML = insuranceData.resultHTML;

                submissionPayload = {
                    _subject: `Cotação Seguro RESIDENCIAL - ${quoteData.nome}`,
                    'Tipo de Seguro': 'Residencial',
                    ...getCommonDataForEmail(quoteData),
                    'Tipo de Imóvel': quoteData.tipoImovel,
                    'Valor do Imóvel': formatCurrency(parseFloat(quoteData.valorImovel)),
                    'Valor do Conteúdo': formatCurrency(parseFloat(quoteData.valorConteudo)),
                    'Coberturas Adicionais': quoteData.coberturas.join(', ') || 'Nenhuma',
                    'Sistemas de Segurança': quoteData.seguranca.join(', ') || 'Nenhum',
                    '--- RESULTADO ---': '---',
                    'Valor Mensal Estimado': formatCurrency(insuranceData.monthlyValue),
                    'Valor Anual Estimado': formatCurrency(insuranceData.annualValue),
                };

            } else if (insuranceType === 'vida') {
                insuranceData = calculateLifeInsurance(quoteData);
                resultContent.innerHTML = insuranceData.resultHTML;

                submissionPayload = {
                    _subject: `Cotação Seguro de VIDA - ${quoteData.nome}`,
                    'Tipo de Seguro': 'Vida',
                    ...getCommonDataForEmail(quoteData),
                    'Profissão': quoteData.profissao,
                    'Capital Segurado': formatCurrency(parseFloat(quoteData.capitalSegurado)),
                    'Renda Mensal': document.getElementById('renda-mensal').options[document.getElementById('renda-mensal').selectedIndex].text,
                    'Fumante': quoteData.fumante,
                    'Pratica Esportes Radicais': quoteData.esportesRadicais,
                    'Histórico Doenças Graves': quoteData.doencasGraves,
                    '--- RESULTADO ---': '---',
                    'Valor Mensal Estimado': formatCurrency(insuranceData.monthlyValue),
                    'Valor Anual Estimado': formatCurrency(insuranceData.annualValue),
                };
            }

            // Envia os dados para o Formspree em segundo plano
            if (submissionPayload) {
                sendQuoteToFormspree(submissionPayload);
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
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('click', (e) => {
            if (e.target.closest('#recalculate-btn')) {
                resetQuoteForm();
            }
        });
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
    localStorage.removeItem('seguroMaxQuoteData'); // Limpa os dados salvos

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
    
    // Fator base: 5% do valor FIPE. Um pouco mais baixo para dar espaço para os multiplicadores.
    let basePercentage = 0.05; 
    let factors = [];

    // 1. Idade e Gênero
    let ageGenderMultiplier = 1;
    if (data.genero === 'masculino') {
        if (age < 26) { ageGenderMultiplier = 1.5; factors.push({name: 'Perfil do Condutor', value: 'Jovem Masculino (risco alto)'}); }
        else if (age <= 40) { ageGenderMultiplier = 1.1; factors.push({name: 'Perfil do Condutor', value: 'Adulto Masculino'}); }
        else { ageGenderMultiplier = 1.0; factors.push({name: 'Perfil do Condutor', value: 'Masculino Experiente'}); }
    } else { // Feminino
        if (age < 26) { ageGenderMultiplier = 1.2; factors.push({name: 'Perfil do Condutor', value: 'Jovem Feminina'}); }
        else { ageGenderMultiplier = 0.9; factors.push({name: 'Perfil do Condutor', value: 'Feminino (risco reduzido)'}); } // Desconto para mulheres
    }

    // 2. Estado Civil
    let maritalStatusMultiplier = 1;
    if (data.estadoCivil === 'casado') {
        maritalStatusMultiplier = 0.9; // -10%
        factors.push({name: 'Estado Civil', value: 'Casado(a) (risco reduzido)'});
    } else {
        factors.push({name: 'Estado Civil', value: 'Solteiro(a)'});
    }

    // 3. Classe de Bônus
    let bonusMultiplier = 1;
    const bonusClass = parseInt(data.classeBonus);
    if (bonusClass === 0) { bonusMultiplier = 1.2; factors.push({name: 'Bônus', value: 'Classe 0 (1º seguro, risco maior)'}); }
    else if (bonusClass <= 3) { bonusMultiplier = 1.0; factors.push({name: 'Bônus', value: `Classe ${bonusClass} (bom histórico)`}); }
    else if (bonusClass <= 6) { bonusMultiplier = 0.85; factors.push({name: 'Bônus', value: `Classe ${bonusClass} (ótimo histórico, -15%)`}); }
    else { bonusMultiplier = 0.7; factors.push({name: 'Bônus', value: `Classe ${bonusClass} (excelente histórico, -30%)`}); }

    // 4. Garagem
    let garageMultiplier = 1;
    if (data.garagemCasa === 'sim' && data.garagemTrabalho === 'sim') {
        garageMultiplier = 0.85; // -15%
        factors.push({name: 'Garagem', value: 'Em casa e no trabalho (risco baixo)'});
    } else if (data.garagemCasa === 'sim') {
        garageMultiplier = 0.93; // -7%
        factors.push({name: 'Garagem', value: 'Apenas em casa (risco médio)'});
    } else {
        garageMultiplier = 1.1; // +10%
        factors.push({name: 'Garagem', value: 'Sem garagem (risco alto)'});
    }
    
    // 5. Ajuste por Tipo de Uso do Veículo
    // O uso comercial ou por aplicativo aumenta a exposição ao risco (mais tempo na rua).
    const tipoUso = data.tipoUso;
    let usageMultiplier = 1;
    switch (tipoUso) {
        case 'particular':
            usageMultiplier = 1;
            factors.push({name: 'Uso do Veículo', value: 'Particular'});
            break;
        case 'aplicativo':
            usageMultiplier = 1.6; // +60%
            factors.push({name: 'Uso do Veículo', value: 'Aplicativo (risco alto)'});
            break;
        case 'empresarial':
            usageMultiplier = 1.3; // +30%
            factors.push({name: 'Uso do Veículo', value: 'Empresarial (risco elevado)'});
            break;
    }
    
    // 6. Ajuste por Localização (CEP de Pernoite)
    // Simulação baseada no primeiro dígito do CEP para representar diferentes níveis de risco (roubo, furto) por região.
    const cepPernoite = data.cepPernoite.replace(/\D/g, '');
    let locationMultiplier = 1;
    
    const firstDigit = parseInt(cepPernoite[0]);
    if (firstDigit === 0 || firstDigit === 2) { // Grande SP, Grande Rio/ES
        locationMultiplier = 1.3; // +30%
        factors.push({name: 'Localização (Pernoite)', value: 'Grande Metrópole (risco alto)'});
    } else if ([3, 4, 5, 7].includes(firstDigit)) { // Outras capitais e regiões metropolitanas
        locationMultiplier = 1.1; // +10%
        factors.push({name: 'Localização (Pernoite)', value: 'Capital/Região Metropolitana'});
    } else {
        locationMultiplier = 0.9; // -10%
        factors.push({name: 'Localização (Pernoite)', value: 'Interior (risco reduzido)'});
    }
    
    // 7. Ajuste por Idade do Veículo
    // Carros mais antigos podem ter peças mais difíceis de encontrar, mas o valor do veículo é menor.
    const anoVeiculo = parseInt(document.getElementById('ano').options[document.getElementById('ano').selectedIndex]?.text?.split(' ')[0] || new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - anoVeiculo;
    
    let ageVehicleMultiplier = 1;
    let vehicleAgeGroup = '';
    if (vehicleAge <= 2) {
        ageVehicleMultiplier = 1.2; // +20% (peças caras, visado para roubo)
        factors.push({name: 'Idade do Veículo', value: 'Novo (0-2 anos)'});
    } else if (vehicleAge <= 8) {
        ageVehicleMultiplier = 1; // Fator neutro
        factors.push({name: 'Idade do Veículo', value: 'Seminovo (3-8 anos)'});
    } else if (vehicleAge <= 15) {
        ageVehicleMultiplier = 0.8; // -20%
        factors.push({name: 'Idade do Veículo', value: 'Usado (9-15 anos, risco menor)'});
    } else {
        ageVehicleMultiplier = 0.6; // -40%
        factors.push({name: 'Idade do Veículo', value: 'Antigo (15+ anos, risco baixo)'});
    }
    
    // --- Cálculo Final ---
    // Multiplica o percentual base por todos os fatores de ajuste.
    const finalPercentage = basePercentage * ageGenderMultiplier * maritalStatusMultiplier * bonusMultiplier * garageMultiplier * usageMultiplier * locationMultiplier * ageVehicleMultiplier;
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

    return { plans, factors };
}

// Calcular valor do seguro residencial
function calculateResidentialInsurance(data) {
    // --- Fatores de Cálculo ---
    // A lógica abaixo é uma SIMULAÇÃO. Em um cenário real, os cálculos seriam feitos por um sistema de backend seguro.

    // Coleta e conversão dos dados do formulário
    const cep = data.cep.replace(/\D/g, '');
    const valorImovel = parseFloat(data.valorImovel) || 0;
    const valorConteudo = parseFloat(data.valorConteudo) || 0;
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
    let propertyMultiplier = 1, usageMultiplier = 1, constructionMultiplier = 1, securityMultiplier = 1, locationMultiplier = 1;
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

    // 5. Ajuste por localização (CEP)
    const firstDigit = parseInt(cep[0]);
    if (firstDigit === 0 || firstDigit === 2) { // Grande SP, Grande Rio/ES
        locationMultiplier = 1.25; // +25%
        fatoresResumo.push('Localização: Grande Metrópole (risco elevado)');
    } else if ([3, 4, 5, 7].includes(firstDigit)) { // Outras capitais e regiões metropolitanas
        locationMultiplier = 1.1; // +10%
        fatoresResumo.push('Localização: Capital/Região Metropolitana');
    } else {
        locationMultiplier = 1.0;
        fatoresResumo.push('Localização: Interior/Outras (risco padrão)');
    }

    // 6. Ajuste por sistemas de segurança (Aplicam descontos, reduzindo o prêmio).
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
    let premioAjustado = premioBase * propertyMultiplier * usageMultiplier * constructionMultiplier * securityMultiplier * locationMultiplier;

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
    const profissao = data.profissao.trim().toLowerCase();
    const rendaMensal = parseFloat(data.rendaMensal) || 0;
    const esportesRadicais = data.esportesRadicais;
    const fumante = data.fumante;    
    const doencasGraves = data.doencasGraves;
    
    // Melhoria: Calcular idade do segurado de forma mais precisa
    const birthDate = new Date(data.nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
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
    
    if (riskProfessions.some(prof => profissao.includes(prof))) {
        professionMultiplier = 1.8; // +80%
        professionRisk = 'Profissão de alto risco';
    } else if (lowRiskProfessions.some(prof => profissao.includes(prof))) {
        professionMultiplier = 0.9; // -10%
        professionRisk = 'Profissão de baixo risco';
    } else {
        professionMultiplier = 1; // Fator neutro
        professionRisk = 'Profissão de risco médio';
    }
    
    // 3. Ajuste por hábitos e saúde (Fatores que impactam diretamente a expectativa de vida).
    let habitsMultiplier = 1;
    let incomeRatioMultiplier = 1;
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
    
    // 4. Ajuste por Renda vs Capital Segurado
    if (rendaMensal > 0 && (capitalSegurado / rendaMensal > 120)) {
        incomeRatioMultiplier = 1.1; // +10%
        habitsInfo.push('Capital elevado vs. Renda');
    }

    if (habitsInfo.length === 0) {
        habitsInfo.push('Sem fatores de risco adicionais');
    }
    
    // --- Cálculo Final ---
    const finalPercentage = basePercentage * ageMultiplier * professionMultiplier * habitsMultiplier * incomeRatioMultiplier;
    // Aplica o percentual final sobre o capital segurado.
    const annualValue = capitalSegurado * finalPercentage;
    const monthlyValue = annualValue / 12;
    
    // Melhoria: Obter o texto da faixa de renda para exibição
    const rendaSelect = document.getElementById('renda-mensal');
    const rendaText = rendaSelect.options[rendaSelect.selectedIndex].text;
    
    // Melhoria: Montagem do HTML de resultado usando a função formatCurrency
    const resultHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-bold text-blue-800 mb-2">Capital Segurado</h4>
                <p class="text-2xl font-bold text-blue-600">${formatCurrency(capitalSegurado)}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-bold text-green-800 mb-2">Prêmio Anual Estimado</h4>
                <p class="text-2xl font-bold text-green-600">${formatCurrency(annualValue)}</p>
                <p class="text-sm text-green-700 mt-1">Aproximadamente ${formatCurrency(monthlyValue)}/mês</p>
            </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-2">Fatores Considerados no Cálculo:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
                <li>• Capital segurado: ${formatCurrency(capitalSegurado)}</li>
                <li>• Idade: ${ageGroup}</li>
                <li>• Profissão: ${professionRisk}</li>
                <li>• Hábitos e saúde: ${habitsInfo.join(', ')}</li>
                <li>• Renda mensal: ${rendaText}</li>
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
                    otherIcon.classList.remove('text-orange-500');
                    otherIcon.classList.add('text-gray-500');
                }
            });
            
            // Alterna a visibilidade da resposta e a rotação do ícone
            answer.classList.toggle('hidden');
            icon.classList.toggle('rotate-180', isOpening);
            icon.classList.toggle('text-orange-500', isOpening);
            icon.classList.toggle('text-gray-500', !isOpening);
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
                <div class="mt-6">
                    <button id="recalculate-btn" type="button" class="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-300"><i class="fas fa-redo-alt mr-2"></i>Calcular Novamente</button>
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
        let firstInvalidField = null;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isStepValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = input;
                }
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

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
function generatePlansHtml(plans, factors) {
    const allFeatures = [...new Set(plans.flatMap(p => p.features))];

    const plansHtml = plans.map(plan => {
        const isRecommended = plan.isRecommended || false;
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

    const factorsHtml = `
        <div class="mt-8 p-4 bg-gray-100 rounded-lg border">
            <h4 class="font-bold text-gray-800 mb-3 text-center">Fatores Considerados na Simulação</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-700">
                ${factors.map(factor => `
                    <div><strong>${factor.name}:</strong> ${factor.value}</div>
                `).join('')}
            </div>
        </div>
    `;

    return `<div class="grid md:grid-cols-3 gap-6 text-left">${plansHtml}</div>
            ${factorsHtml}`;
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
        let requiredFieldIds = {
            'auto': ['marca', 'modelo', 'ano', 'chassi', 'cep-pernoite', 'tipo-uso'],
            'residencial': ['tipo-imovel', 'finalidade-imovel', 'tipo-construcao', 'area-construida', 'valor-imovel', 'valor-conteudo'],
            'vida': ['capital-segurado', 'profissao', 'renda-mensal']
        };
        
        const fieldsToMakeRequired = requiredFieldIds[insuranceType] || [];
        fieldsToMakeRequired.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', 'required');
            }
        });
        ['genero', 'estado-civil', 'classe-bonus', 'garagem-casa', 'garagem-trabalho'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', 'required');
            }
        });
    }
}

// Configuração das animações de scroll
function setupScrollAnimations() {
    const animatedItems = document.querySelectorAll('.animate-on-scroll');
    if (animatedItems.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedItems.forEach(item => {
        observer.observe(item);
    });
}

// Configuração da animação de contagem de números
function setupNumberCounters() {
    const counters = document.querySelectorAll('[data-count-up]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const targetValue = parseInt(counter.getAttribute('data-count-up'), 10);
                const duration = 2000; // 2 segundos
                const startTime = performance.now();

                const animate = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);
                    const currentValue = Math.floor(progress * targetValue);
                    counter.textContent = currentValue;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        counter.textContent = targetValue;
                    }
                };
                requestAnimationFrame(animate);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.8 });

    counters.forEach(counter => observer.observe(counter));
}

// Configuração do Modal de Políticas
function setupModal() {
    const privacyLink = document.getElementById('privacy-policy-link');
    const cookieLink = document.getElementById('cookie-policy-link');
    const modal = document.getElementById('legal-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const privacyContent = document.getElementById('privacy-policy-content');
    const cookieContent = document.getElementById('cookie-policy-content');

    if (!modal || !privacyLink || !cookieLink) return;

    const openModal = (title, contentToShow) => {
        modalTitle.textContent = title;
        [privacyContent, cookieContent].forEach(content => content.classList.add('hidden'));
        contentToShow.classList.remove('hidden');
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('Política de Privacidade', privacyContent);
    });

    cookieLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('Política de Cookies', cookieContent);
    });

    modalCloseBtn.addEventListener('click', closeModal);

    // Fechar ao clicar no overlay (fundo)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

/**
 * Reúne os dados comuns do cliente para o envio de e-mail.
 * @param {object} data - O objeto de dados da cotação.
 * @returns {object} - Um objeto com os dados pessoais formatados.
 */
function getCommonDataForEmail(data) {
    return {
        'Nome': data.nome,
        'Email': data.email,
        'Telefone': data.telefone,
        'CPF': data.cpf,
        'Data de Nascimento': data.nascimento,
        'Gênero': data.genero,
        'Estado Civil': data.estadoCivil,
        'Endereço (CEP)': data.cep,
    };
}

/**
 * Envia os dados da cotação para um endpoint Formspree.
 * @param {object} data - O objeto com os dados a serem enviados.
 */
async function sendQuoteToFormspree(data) {
    // IMPORTANTE: Substitua 'YOUR_FORM_ID' pelo ID do seu formulário no Formspree.
    // Ex: https://formspree.io/f/xleylqle
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    // Se o endpoint não for alterado, não tenta fazer o envio.
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
        console.warn('Formspree não configurado. O e-mail de cotação não será enviado.');
        return;
    }

    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Cotação enviada com sucesso para o Formspree!');
        } else {
            const responseData = await response.json();
            if (responseData.errors) {
                console.error('Erro ao enviar para o Formspree:', responseData.errors.map(e => e.message).join(', '));
            } else {
                console.error('Erro desconhecido ao enviar para o Formspree.');
            }
        }
    } catch (error) {
        console.error('Falha na requisição para o Formspree:', error);
    }
}

// --- Funções para Persistência de Dados com localStorage ---

/**
 * Salva os dados do formulário de cotação no localStorage.
 */
function saveFormDataToLocalStorage() {
    const form = document.getElementById('quote-form');
    if (!form) return;

    const formData = new FormData(form);
    const data = {};
    
    // Coleta dados de inputs de texto, select, etc.
    for (const [key, value] of formData.entries()) {
        // Tratamento para múltiplos checkboxes com o mesmo nome
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }

    // Garante que o tipo de seguro (radio) seja salvo corretamente
    const insuranceType = form.querySelector('input[name="insurance-type"]:checked');
    if (insuranceType) {
        data['insurance-type'] = insuranceType.value;
    }

    localStorage.setItem('seguroMaxQuoteData', JSON.stringify(data));
}

/**
 * Carrega os dados do formulário do localStorage e preenche os campos.
 */
function loadFormDataFromLocalStorage() {
    const savedData = localStorage.getItem('seguroMaxQuoteData');
    if (!savedData) return;

    const data = JSON.parse(savedData);
    const form = document.getElementById('quote-form');

    for (const key in data) {
        const field = form.elements[key];
        if (field) {
            if (field.type === 'radio') {
                // Para radio buttons, precisamos encontrar o que tem o valor correspondente
                form.querySelector(`input[name="${key}"][value="${data[key]}"]`).checked = true;
            } else if (field.type === 'checkbox') {
                // Para um único checkbox
                field.checked = !!data[key];
            } else if (Array.isArray(field)) { // Para múltiplos checkboxes
                 field.forEach(f => f.checked = data[key].includes(f.value));
            } else {
                field.value = data[key];
            }
            // Dispara um evento de 'change' para que outras lógicas (como carregar modelos FIPE) sejam ativadas
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}
// Logs para debug (remover em produção)
console.log('SeguroMax - Sistema carregado com sucesso!');
