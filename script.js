document.addEventListener('DOMContentLoaded', () => {
    // --- Cookie Consent Banner ---
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const cookiePolicyBannerLink = document.getElementById('cookie-policy-banner-link');

    if (cookieBanner && acceptCookiesBtn) {
        // Check if user has already accepted cookies
        if (!localStorage.getItem('cookies_accepted')) {
            cookieBanner.classList.remove('hidden');
        }

        // Event listener for the accept button
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookies_accepted', 'true');
            cookieBanner.classList.add('hidden');
        });

        // Event listener for the policy link inside the banner
        cookiePolicyBannerLink?.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('cookie'); // Re-uses the existing modal logic
        });
    }

    // --- Navbar Mobile Menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Fechar menu mobile ao clicar em um link
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Smooth Scrolling for anchor links ---
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const navbar = document.querySelector('nav');
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            } catch (error) {
                console.warn('Could not query selector for smooth scroll:', targetId, error);
            }
        });
    });

    // --- Animate on Scroll ---
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });


    // --- Count-Up Animation ---
    const countUpObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = +el.getAttribute('data-count-up');
                let count = 0;
                const duration = 2000;
                const stepTime = Math.max(1, Math.floor(duration / target));
                const timer = setInterval(() => {
                    count++;
                    el.textContent = count;
                    if (count >= target) {
                        el.textContent = target;
                        clearInterval(timer);
                    }
                }, stepTime);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count-up]').forEach(el => {
        countUpObserver.observe(el);
    });

    // --- FAQ Accordion ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const answer = document.getElementById(targetId);
            const icon = button.querySelector('i');
            const isOpen = !answer.classList.contains('hidden');
            answer.classList.toggle('hidden');
            icon.classList.toggle('rotate-180', !isOpen);
        });
    });

    // --- Modal Logic ---
    const legalModal = document.getElementById('legal-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const privacyPolicyContent = document.getElementById('privacy-policy-content');
    const cookiePolicyContent = document.getElementById('cookie-policy-content');

    function openModal(type) {
        if (!legalModal) return;
        if (type === 'privacy') {
            modalTitle.textContent = 'Política de Privacidade';
            privacyPolicyContent.classList.remove('hidden');
            cookiePolicyContent.classList.add('hidden');
        } else if (type === 'cookie') {
            modalTitle.textContent = 'Política de Cookies';
            cookiePolicyContent.classList.remove('hidden');
            privacyPolicyContent.classList.add('hidden');
        }
        legalModal.classList.remove('hidden');
    }

    function closeModal() {
        if (legalModal) legalModal.classList.add('hidden');
    }

    document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => { e.preventDefault(); openModal('privacy'); });
    document.querySelector('a[href="/politica-de-privacidade.html"]')?.addEventListener('click', (e) => { e.preventDefault(); openModal('privacy'); });
    document.getElementById('cookie-policy-link')?.addEventListener('click', (e) => { e.preventDefault(); openModal('cookie'); });
    modalCloseBtn?.addEventListener('click', closeModal);
    legalModal?.addEventListener('click', (e) => { if (e.target === legalModal) closeModal(); });

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    if (contactForm) {
        // Formulário de contato - feedback visual
        if (contactForm && contactSuccess) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    const original = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = original;
                        contactSuccess.classList.remove('hidden');
                        setTimeout(() => contactSuccess.classList.add('hidden'), 5000);
                    }, 2000);
                }
            });
        }
    }

    // --- Quote Form Logic ---
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        const fieldset = document.getElementById('quote-fieldset');
        const privacyConsent = document.getElementById('privacy-consent');
        const progressBar = document.getElementById('progress-bar');
        const steps = Array.from(document.querySelectorAll('.form-step'));
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-quote');
        const quoteResultDiv = document.getElementById('quote-result');
        const recalculateBtn = document.getElementById('recalculate-btn');
        const whatsappRedirectBtn = document.getElementById('whatsapp-redirect-btn');
        const condutorFields = document.getElementById('principal-condutor-fields');
        const simulationPanel = document.getElementById('simulation-content');

        // --- Notification System ---
        const toastContainer = document.getElementById('toast-container');

        const showNotification = (message, type = 'error') => {
            if (!toastContainer) return;

            const toast = document.createElement('div');
            const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
            const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';

            toast.className = `p-4 text-white rounded-lg shadow-lg flex items-center gap-3 ${bgColor}`;
            toast.style.animation = 'toast-in 0.5s ease';
            toast.innerHTML = `
                <i class="fas ${icon} text-xl"></i>
                <span>${message}</span>
            `;

            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'toast-out 0.5s ease forwards';
                toast.addEventListener('animationend', () => {
                    toast.remove();
                });
            }, 5000);
        };

        // --- Input Masking ---
        const applyMask = (event, maskFunction) => {
            setTimeout(() => {
                const input = event.target;
                const originalValue = input.value;
                const maskedValue = maskFunction(originalValue);
                if (originalValue !== maskedValue) {
                    input.value = maskedValue;
                }
            }, 1);
        };

        // --- Debounce utility ---
        const debounce = (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        };
        // --- Módulo: Validações ---
        function validarEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        function validarCPF(cpf) {
            cpf = cpf.replace(/\D/g, '');
            if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
            let soma = 0, resto;
            for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
            resto = (soma * 10) % 11;
            if ((resto === 10) || (resto === 11)) resto = 0;
            if (resto !== parseInt(cpf.substring(9, 10))) return false;
            soma = 0;
            for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
            resto = (soma * 10) % 11;
            if ((resto === 10) || (resto === 11)) resto = 0;
            if (resto !== parseInt(cpf.substring(10, 11))) return false;
            return true;
        }
        function validarTelefone(telefone) {
            telefone = telefone.replace(/\D/g, '');
            return telefone.length === 11;
        }
        // --- Módulo: Máscaras ---
        function formatCPF(value) {
            return value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        function formatPhone(value) {
            return value.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
        }
        function formatCEP(value) {
            return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
        }
        function formatCurrency(value) {
            if (!value) return '';
            let numStr = value.replace(/\D/g, '');
            if (numStr === '') return '';
            const num = parseFloat(numStr) / 100;
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
        }

        // Substituir funções duplicadas por chamadas aos módulos já criados
        document.getElementById('cpf')?.addEventListener('input', (e) => applyMask(e, formatCPF));
        document.getElementById('condutor-cpf')?.addEventListener('input', (e) => applyMask(e, formatCPF));
        document.getElementById('telefone')?.addEventListener('input', (e) => { applyMask(e, formatPhone); validateField(e.target, 'telefone'); });
        document.getElementById('cep')?.addEventListener('input', (e) => applyMask(e, formatCEP));
        document.getElementById('cep-pernoite')?.addEventListener('input', (e) => applyMask(e, formatCEP));
        const currencyFieldIds = ['valor-imovel', 'valor-conteudo', 'capital-segurado', 'renda-mensal', 'valor-carta-credito'];
        currencyFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.type = 'text';
                field.setAttribute('inputmode', 'numeric');
                field.addEventListener('input', (e) => applyMask(e, formatCurrency));
            }
        });

        let currentStep = 1;
        let totalSteps = 3;
        let selectedInsuranceType = '';


        // --- API Endpoints ---
        const API_ENDPOINTS = {
            VIA_CEP: (cep) => `https://viacep.com.br/ws/${cep}/json/`,
            FIPE_MARCAS: 'https://parallelum.com.br/fipe/api/v1/carros/marcas',
            FIPE_MODELOS: (marcaId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos`,
            FIPE_ANOS: (marcaId, modeloId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos/${modeloId}/anos`,
            FORM_SUBMIT: 'https://formspree.io/f/myzdyybp'
        };
        const updateProgressBar = () => {            
            const progress = (currentStep / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        };

        const showStep = (stepNumber) => {
            const currentVisibleStep = steps.find(s => !s.classList.contains('hidden'));
            const nextStep = steps.find(s => {
                const stepData = parseInt(s.dataset.step);
                const isTypeSpecificStep = s.dataset.insuranceType;
                if (stepData !== stepNumber) return false;
                if (isTypeSpecificStep && isTypeSpecificStep !== selectedInsuranceType) return false;
                return true;
            });

            const transitionDuration = 300; // Must match the fadeOut animation duration

            if (!nextStep || (currentVisibleStep && currentVisibleStep === nextStep)) {
                return; // Do nothing if no next step or it's the same step
            }

            if (currentVisibleStep) {
                currentVisibleStep.classList.add('form-step-fade-out');
                setTimeout(() => {
                    currentVisibleStep.classList.add('hidden');
                    currentVisibleStep.classList.remove('form-step-fade-out');
                    nextStep.classList.remove('hidden');
                    nextStep.classList.add('form-step-fade-in');
                }, transitionDuration);
            } else {
                // Initial load
                nextStep.classList.remove('hidden');
                nextStep.classList.add('form-step-fade-in');
            }

            prevBtn.classList.toggle('hidden', currentStep === 1);
            nextBtn.classList.toggle('hidden', currentStep === totalSteps);
            submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
            if (currentStep === totalSteps) {
                generateReviewSummary();
            }
            updateProgressBar();
        };

        // --- Interactive Simulator Panel ---
        const updateSimulationPanel = () => {
            if (!simulationPanel) return;

            const data = {};
            const formElements = quoteForm.querySelectorAll('input, select, textarea');
            formElements.forEach(el => {
                const key = el.name || el.id;
                if (!key) return;

                if (el.type === 'radio' ) {
                    if (el.checked) data[key] = el.value;
                } else if (el.type === 'checkbox') {
                    // Usar o 'name' do checkbox como chave para agrupar as seleções
                    const groupName = el.name;
                    if (!groupName) return;

                    if (!data[groupName]) data[groupName] = [];
                    if (el.checked) data[groupName].push(el.nextElementSibling.textContent.trim());
                } else {
                    // Para selects, pegar o texto da opção selecionada
                    if (el.tagName === 'SELECT' && el.selectedIndex > 0) {
                        data[key] = el.options[el.selectedIndex].text;
                    } else {
                         data[key] = el.value;
                    }
                }
            });

            let html = '';

            if (data['insurance-type']) {
                const typeName = { auto: 'Automóvel', residencial: 'Residencial', vida: 'de Vida', consorcio: 'Consórcio' }[data['insurance-type']];
                html += `<div class="summary-item"><strong>Tipo:</strong> ${typeName}</div>`;
            }
            if (data.nome) {
                html += `<div class="summary-item"><strong>Segurado:</strong> ${data.nome}</div>`;
            }
            if (data.modelo) {
                html += `<div class="summary-item"><strong>Veículo:</strong> ${data.marca} ${data.modelo} (${data.ano})</div>`;
                if (data['tipo-uso']) {
                    html += `<div class="summary-item" style="padding-left: 2rem; border-color: #9ca3af;"><strong>Uso:</strong> ${data['tipo-uso']}</div>`;
                }
                if (data['classe-bonus']) {
                    html += `<div class="summary-item" style="padding-left: 2rem; border-color: #9ca3af;"><strong>Bônus:</strong> Classe ${data['classe-bonus']}</div>`;
                }
                if (data['proprietario-condutor'] === 'nao' && data['condutor-nome']) {
                    html += `<div class="summary-item" style="padding-left: 2rem; border-color: #9ca3af;"><strong>Condutor:</strong> ${data['condutor-nome']}</div>`;
                }
            }
            if (data['tipo-imovel']) {
                html += `<div class="summary-item"><strong>Imóvel:</strong> ${data['tipo-imovel']} (${data['finalidade-imovel']})</div>`;
                if (data['valor-imovel']) {
                    html += `<div class="summary-item" style="padding-left: 2rem; border-color: #9ca3af;"><strong>Valor do Imóvel:</strong> ${data['valor-imovel']}</div>`;
                }
            }
            if (data['capital-segurado']) {
                html += `<div class="summary-item"><strong>Capital Segurado:</strong> ${data['capital-segurado']}</div>`;
                if (data.profissao) {
                    html += `<div class="summary-item" style="padding-left: 2rem; border-color: #9ca3af;"><strong>Profissão:</strong> ${data.profissao}</div>`;
                }
                if (data.fumante) {
                    const fumanteText = data.fumante === 'sim' ? 'Sim' : 'Não';
                    html += `<div class="summary-item" style="padding-left: 2rem; border-color: #9ca3af;"><strong>Fumante:</strong> ${fumanteText}</div>`;
                }
            }
             if (data['tipo-consorcio']) {
                html += `<div class="summary-item"><strong>Consórcio:</strong> ${data['tipo-consorcio']} - ${data['valor-carta-credito']}</div>`;
            }
            if (data.coberturas && data.coberturas.length > 0) {
                html += `<div class="summary-item"><strong>Coberturas Adicionais:</strong> ${data.coberturas.join(', ')}</div>`;
            }
            if (data.seguranca && data.seguranca.length > 0) {
                html += `<div class="summary-item"><strong>Sistemas de Segurança:</strong> ${data.seguranca.join(', ')}</div>`;
            }


            if (html) {
                simulationPanel.innerHTML = html;
            } else {
                simulationPanel.innerHTML = `<p class="italic text-gray-500">Preencha os campos do formulário para ver o resumo da sua cotação aqui.</p>`;
            }
        };


        const requiredFields = {
            1: ['insurance-type'],
            2: ['nome', 'cpf', 'nascimento', 'telefone', 'email', 'genero', 'estado-civil'],
            3: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
            4: {
                auto: ['marca', 'modelo', 'ano', 'chassi', 'tipo-uso', 'cep-pernoite', 'classe-bonus', 'garagem-casa', 'garagem-trabalho'], // chassi is required
                residencial: ['tipo-imovel', 'finalidade-imovel', 'tipo-construcao', 'area-construida', 'valor-imovel', 'valor-conteudo'],
                vida: ['capital-segurado', 'profissao', 'renda-mensal'],
                consorcio: ['tipo-consorcio', 'valor-carta-credito']
            }
        };

        const validateStep = (stepNumber) => {
            const stepRules = requiredFields[stepNumber];
            if (!stepRules) return true;
            let requiredIds = [];
            if (Array.isArray(stepRules)) {
                requiredIds = stepRules;
            } else if (typeof stepRules === 'object' && selectedInsuranceType && stepRules[selectedInsuranceType]) {
                requiredIds = stepRules[selectedInsuranceType];
            }
            if (stepNumber === 4 && selectedInsuranceType === 'auto') {
                const ownerIsNotDriver = document.querySelector('input[name="proprietario-condutor"][value="nao"]:checked');
                if (ownerIsNotDriver) {
                    requiredIds.push('condutor-nome', 'condutor-cpf');
                }
            }
            if (requiredIds.length === 0) return true;
            let allFieldsValid = true;
            requiredIds.forEach(id => {
                const input = document.getElementById(id);
                if (!input || input.offsetParent === null) return;
                const wrapper = input.closest('.relative'); // Assumindo que os inputs estão em um div relative
                const errorDiv = input.closest('div')?.querySelector('.error-message');
                if (errorDiv) errorDiv.classList.add('hidden');
                input.classList.remove('field-invalid');
                wrapper?.querySelector('.validation-icon')?.remove();

                if (!input.value.trim()) {
                    allFieldsValid = false;
                    input.classList.add('field-invalid');
                    if (errorDiv) {
                        errorDiv.textContent = 'Campo obrigatório.';
                        errorDiv.classList.remove('hidden');
                    }
                }
            });
            return allFieldsValid;
        };

        const validateField = (input, type) => {
            if (!input) return;
            const wrapper = input.closest('.relative');
            const errorDiv = wrapper?.querySelector('.error-message');
            let isValid = false;
            let errorMessage = '';

            // Limpa feedback anterior
            wrapper?.querySelector('.validation-icon')?.remove();
            input.classList.remove('field-invalid', 'field-valid');
            if (errorDiv) errorDiv.classList.add('hidden');

            const value = input.value;

            if (!value.trim()) {
                return; // Não valida campos vazios, isso é feito no validateStep
            }

            switch (type) {
                case 'cpf':
                    isValid = validarCPF(value);
                    errorMessage = 'CPF inválido.';
                    break;
                case 'email':
                    isValid = validarEmail(value);
                    errorMessage = 'Formato de e-mail inválido.';
                    break;
                case 'telefone':
                    isValid = validarTelefone(value);
                    errorMessage = 'Telefone inválido (precisa ter 11 dígitos).';
                    break;
                default:
                    isValid = true; // Para outros campos, apenas a presença de valor é suficiente
                    break;
            }

            if (isValid) {
                input.classList.add('field-valid');
            } else {
                input.classList.add('field-invalid');
                if (errorDiv) {
                    errorDiv.textContent = errorMessage;
                    errorDiv.classList.remove('hidden');
                }
            }
        };

        // Adiciona validação em tempo real com debounce
        document.getElementById('cpf')?.addEventListener('input', debounce((e) => validateField(e.target, 'cpf'), 500));
        document.getElementById('condutor-cpf')?.addEventListener('input', debounce((e) => validateField(e.target, 'cpf'), 500));
        document.getElementById('email')?.addEventListener('input', debounce((e) => validateField(e.target, 'email'), 500));

        const generateReviewSummary = () => {
             const reviewContainer = document.getElementById('review-summary');
             if (!reviewContainer) return;
 
             const data = getFormData(); // Pega todos os dados do formulário uma única vez.
             let html = '';
 
             const createSection = (title, step, content) => {
                 if (!content) return '';
                 return `
                     <div class="review-section border-b pb-4 mb-4">
                         <div class="flex justify-between items-center mb-2">
                             <h4 class="text-lg font-semibold text-gray-700">${title}</h4>
                             <button type="button" class="edit-step-btn text-sm text-blue-600 hover:underline" data-step-target="${step}">Editar</button>
                         </div>
                         <div class="text-gray-600 space-y-1 text-sm">${content}</div>
                     </div>
                 `;
             };
 
             // Seção de Dados Pessoais (Etapa 2)
             html += createSection('Dados Pessoais', 2, `
                 <p><strong>Nome:</strong> ${data.nome || 'Não informado'}</p>
                 <p><strong>Email:</strong> ${data.email || 'Não informado'}</p>
                 <p><strong>Telefone:</strong> ${data.telefone || 'Não informado'}</p>
             `);
 
             // Seção de Endereço (Etapa 3)
             html += createSection('Endereço', 3, `
                 <p>${data.rua || ''}, ${data.numero || 'S/N'} - ${data.bairro || ''}</p>
                 <p>${data.cidade || ''} - ${data.estado || ''}, CEP: ${data.cep || ''}</p>
             `);
 
             // Seção Específica do Seguro (Etapa 4)
             // Reutiliza o HTML já gerado pelo painel lateral para manter a consistência.
             const insuranceDetailsHtml = simulationPanel.innerHTML;
             const typeName = { auto: 'Automóvel', residencial: 'Residencial', vida: 'de Vida', consorcio: 'Consórcio' }[selectedInsuranceType] || 'Geral';
             const insuranceTitle = `Detalhes do Seguro ${typeName}`;
             html += createSection(insuranceTitle, 4, insuranceDetailsHtml.replace(/summary-item/g, 'review-item p-2').replace(/<strong>/g, '<strong class="font-medium text-gray-700">'));
 
             reviewContainer.innerHTML = html;
             addEditButtonListeners();
         };

        const provideInputFeedback = (event) => {
            const input = event.target;
            if (!input.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"], select, textarea')) {
                return;
            }
            const wrapper = input.closest('.relative');
            const errorDiv = input.closest('div')?.querySelector('.error-message');
            
            // Limpa feedback anterior
            wrapper?.querySelector('.validation-icon')?.remove();
            input.classList.remove('field-invalid', 'field-valid');

            if (errorDiv && !errorDiv.classList.contains('hidden')) {
                errorDiv.classList.add('hidden');
            }

            if (input.value.trim() !== '') {
                input.classList.add('field-valid');
            }
        };

        quoteForm.addEventListener('input', (e) => { provideInputFeedback(e); updateSimulationPanel(); });
        quoteForm.addEventListener('change', (e) => { provideInputFeedback(e); updateSimulationPanel(); });

        fieldset.disabled = !privacyConsent.checked;
        showStep(currentStep);

        privacyConsent.addEventListener('change', () => {
            fieldset.disabled = !privacyConsent.checked;
        });

        document.querySelectorAll('.insurance-type-radio').forEach(radio => {
            radio.addEventListener('click', () => {
                selectedInsuranceType = radio.value;
                totalSteps = 5; // Adicionada a etapa de revisão
                document.querySelectorAll('.insurance-type-card').forEach(card => card.classList.remove('border-blue-500', 'bg-blue-50'));
                radio.closest('.insurance-type-option').querySelector('.insurance-type-card').classList.add('border-blue-500', 'bg-blue-50');
                if (selectedInsuranceType === 'auto') loadMarcas();
            });
        });

        const addEditButtonListeners = () => {
            document.querySelectorAll('.edit-step-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const targetStep = parseInt(e.target.dataset.stepTarget, 10);
                    currentStep = targetStep;
                    showStep(currentStep);
                });
            });
        };

        const initializeConditionalFields = () => {
            const condutorRadios = document.querySelectorAll('input[name="proprietario-condutor"]');

            if (!condutorFields || condutorRadios.length === 0) {
                return;
            }

            const toggleCondutorFields = (event) => {
                const shouldShow = event.target.value === 'nao';
                condutorFields.classList.toggle('hidden', !shouldShow);
            };

            condutorRadios.forEach(radio => {
                radio.addEventListener('change', toggleCondutorFields);
            });
        };
        initializeConditionalFields();

        nextBtn.addEventListener('click', () => {
            if (currentStep === 1 && !selectedInsuranceType) {
                showNotification('Por favor, selecione um tipo de seguro.');
                return;
            }
            if (!validateStep(currentStep)) {
                showNotification('Por favor, preencha todos os campos obrigatórios destacados.');
                return;
            }
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });

        const getFormData = () => {
            const data = {};
            const formElements = quoteForm.querySelectorAll('input, select, textarea');
            formElements.forEach(el => {
                const key = el.name || el.id;
                if (!key) return;

                if (el.type === 'radio') {
                    if (el.checked) data[key] = el.value;
                } else if (el.type === 'checkbox') {
                    const groupName = el.name;
                    if (!data[groupName]) data[groupName] = [];
                    if (el.checked) data[groupName].push(el.nextElementSibling.textContent.trim());
                } else if (el.tagName === 'SELECT' && el.selectedIndex > 0) {
                    data[key] = el.options[el.selectedIndex].text;
                } else {
                    data[key] = el.value;
                }
            });
            return data;
        };

        const resetForm = () => {
            quoteResultDiv.classList.add('hidden');
            fieldset.classList.remove('hidden');
            quoteForm.reset();

            // Clear all visual feedback and error messages
            quoteForm.querySelectorAll('input, select, textarea').forEach(input => {
                input.classList.remove('field-invalid', 'field-valid');
                const errorDiv = input.closest('div')?.querySelector('.error-message');
                if (errorDiv) errorDiv.classList.add('hidden');
            });

            // Reset specific elements and state
            fieldset.disabled = true;
            privacyConsent.checked = false;
            condutorFields?.classList.add('hidden');
            document.querySelectorAll('.insurance-type-card').forEach(card => {
                card.classList.remove('border-blue-500', 'bg-blue-50');
            });

            // Manually reset FIPE fields to their initial state, as form.reset() doesn't handle this.
            const modeloSelect = document.getElementById('modelo');
            const anoSelect = document.getElementById('ano');
            if (modeloSelect) {
                modeloSelect.innerHTML = '<option value="">Selecione a marca primeiro</option>';
                modeloSelect.disabled = true;
            }
            if (anoSelect) {
                anoSelect.innerHTML = '<option value="">Selecione o modelo primeiro</option>';
                anoSelect.disabled = true;
            }

            // Reset form state variables
            currentStep = 1;
            updateSimulationPanel(); // Limpa o painel
            totalSteps = 3;
            selectedInsuranceType = '';

            // Show the first step
            showStep(1);
        };

        recalculateBtn.addEventListener('click', resetForm);

        // --- Validação Avançada ---
        // --- Validação customizada no submit ---
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let erro = false;
            // Validação de campos obrigatórios (detalhada)
            const requiredInputs = [
                {id: 'nome', msg: 'Digite seu nome completo.'},
                {id: 'cpf', msg: 'Digite um CPF válido.'},
                {id: 'nascimento', msg: 'Informe sua data de nascimento.'},
                {id: 'telefone', msg: 'Digite um telefone válido (11 dígitos).'},
                {id: 'email', msg: 'Digite um e-mail válido.'},
                {id: 'genero', msg: 'Selecione o gênero.'},
                {id: 'estado-civil', msg: 'Selecione o estado civil.'},
                {id: 'cep', msg: 'Digite um CEP válido.'},
                {id: 'rua', msg: 'Informe a rua.'},
                {id: 'numero', msg: 'Informe o número.'},
                {id: 'bairro', msg: 'Informe o bairro.'},
                {id: 'cidade', msg: 'Informe a cidade.'},
                {id: 'estado', msg: 'Selecione o estado.'}
            ];
            requiredInputs.forEach(field => {
                const input = document.getElementById(field.id);
                if (input && !input.value.trim()) {
                    erro = true;
                    input.classList.add('field-invalid');
                    const errorDiv = input.closest('div')?.querySelector('.error-message');
                    if (errorDiv) {
                        errorDiv.textContent = field.msg;
                        errorDiv.classList.remove('hidden');
                    }
                }
            });
            if (erro) {
                showNotification('Por favor, corrija os campos destacados antes de enviar.');
                return;
            }
            if (!validateStep(currentStep)) {
                showNotification('Por favor, preencha todos os campos obrigatórios destacados antes de enviar.');
                return;
            }
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

            const data = { insuranceType: selectedInsuranceType };
            const formElements = quoteForm.querySelectorAll('input, select, textarea');
            formElements.forEach(el => {
                const key = el.name || el.id;
                if (!key) return;
                if (el.type === 'radio') {
                    if (el.checked) data[key] = el.value;
                } else {
                    data[key] = el.value;
                }
            });

            const insuranceTypeName = { auto: 'Automóvel', vida: 'de Vida', residencial: 'Residencial', consorcio: 'Consórcio' }[selectedInsuranceType] || selectedInsuranceType;
            const personalDataSection = `\n**DADOS DO CLIENTE**\n- **Nome:** ${data.nome || 'Não informado'}\n- **Email:** ${data.email || 'Não informado'}\n- **Telefone:** ${data.telefone || 'Não informado'}\n- **CPF:** ${data.cpf || 'Não informado'}\n- **Data de Nascimento:** ${data.nascimento ? new Date(data.nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}\n- **Gênero:** ${data.genero || 'Não informado'}\n- **Estado Civil:** ${data['estado-civil'] || 'Não informado'}`;
            const addressSection = `\n**ENDEREÇO**\n- **CEP:** ${data.cep || 'Não informado'}\n- **Logradouro:** ${data.rua || 'Não informado'}, Nº ${data.numero || 'S/N'}\n- **Bairro:** ${data.bairro || 'Não informado'}\n- **Cidade/UF:** ${data.cidade || 'Não informado'}/${data.estado || 'Não informado'}`;
            let detailsSection = '';
            if (selectedInsuranceType === 'auto') {
                const marcaText = data.marca ? marcaSelect.options[marcaSelect.selectedIndex].text : 'Não informado';
                const modeloText = data.modelo ? modeloSelect.options[modeloSelect.selectedIndex].text : 'Não informado';
                const anoText = data.ano ? anoSelect.options[anoSelect.selectedIndex].text : 'Não informado';
                let condutorSection = `\n- **Proprietário é o Principal Condutor?** ${data['proprietario-condutor'] === 'sim' ? 'Sim' : 'Não'}`;
                if (data['proprietario-condutor'] === 'nao') {
                    condutorSection += `\n- **Nome do Principal Condutor:** ${data['condutor-nome'] || 'Não informado'}\n- **CPF do Principal Condutor:** ${data['condutor-cpf'] || 'Não informado'}`;
                }
                detailsSection = `\n**DADOS DO VEÍCULO**\n- **Marca:** ${marcaText}\n- **Modelo:** ${modeloText}\n- **Ano/Modelo:** ${anoText}\n- **Chassi:** ${data.chassi || 'Não informado'}\n- **Placa:** ${data.placa || 'Não informado'}\n- **Tipo de Uso:** ${data['tipo-uso'] || 'Não informado'}\n- **CEP de Pernoite:** ${data['cep-pernoite'] || 'Não informado'}\n- **Classe de Bônus:** ${data['classe-bonus'] || 'Não informado'}\n- **Garagem em Casa?** ${data['garagem-casa'] || 'Não informado'}\n- **Garagem no Trabalho/Estudo?** ${data['garagem-trabalho'] || 'Não informado'}${condutorSection}`;
            } else if (selectedInsuranceType === 'residencial') {
                const coberturas = Array.from(document.querySelectorAll('input[name="coberturas"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()).join(', ') || 'Nenhuma';
                const seguranca = Array.from(document.querySelectorAll('input[name="seguranca"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()).join(', ') || 'Nenhuma';
                detailsSection = `\n**DADOS DO IMÓVEL**\n- **Tipo de Imóvel:** ${data['tipo-imovel'] || 'Não informado'}\n- **Uso do Imóvel:** ${data['finalidade-imovel'] || 'Não informado'}\n- **Tipo de Construção:** ${data['tipo-construcao'] || 'Não informado'}\n- **Área Construída (m²):** ${data['area-construida'] || 'Não informado'}\n- **Valor de Reconstrução (R$):** ${data['valor-imovel'] || 'Não informado'}\n- **Valor dos Bens/Conteúdo (R$):** ${data['valor-conteudo'] || 'Não informado'}\n- **Coberturas Adicionais:** ${coberturas}\n- **Sistemas de Segurança:** ${seguranca}`;
            } else if (selectedInsuranceType === 'vida') {
                detailsSection = `\n**DADOS DO SEGURO DE VIDA**\n- **Capital Segurado Desejado (R$):** ${data['capital-segurado'] || 'Não informado'}\n- **Profissão:** ${data.profissao || 'Não informado'}\n- **Renda Mensal (R$):** ${data['renda-mensal'] || 'Não informado'}\n- **Pratica Esportes Radicais?** ${data['esportes-radicais'] || 'Não informado'}\n- **Fumante?** ${data.fumante || 'Não informado'}\n- **Histórico de Doenças Graves?** ${data['doencas-graves'] || 'Não informado'}`;
            } else if (selectedInsuranceType === 'consorcio') {
                detailsSection = `\n**DADOS DO CONSÓRCIO**\n- **Tipo de Consórcio:** ${data['tipo-consorcio'] || 'Não informado'}\n- **Valor da Carta de Crédito (R$):** ${data['valor-carta-credito'] || 'Não informado'}\n- **Prazo Desejado (meses):** ${data['prazo-desejado'] || 'Não informado'}`;
            }
            const emailBody = `\nNova Solicitação de Cotação de Seguro ${insuranceTypeName}\n----------------------------------------------------\n${personalDataSection}\n${addressSection}\n${detailsSection}\n----------------------------------------------------\nEste e-mail foi enviado automaticamente pelo formulário de cotação do site.\n`;
            const payload = { _subject: `Cotação de Seguro ${insuranceTypeName} - ${data.nome}`, _replyto: data.email, "Solicitação de Cotação": emailBody };

            try {
                const response = await sendDataToBroker(payload);
                if (!response.ok) throw new Error('Falha ao enviar a solicitação.');
                fieldset.classList.add('hidden');
                quoteResultDiv.classList.remove('hidden');
                const phone = '5518981558125';
                const clientName = document.getElementById('nome').value.split(' ')[0] || 'Cliente';
                const message = `Olá! Acabei de fazer uma cotação pelo site em nome de ${clientName} e gostaria de saber o preço.`;
                whatsappRedirectBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            } catch (error) {
                console.error('Submission Error:', error);
                showNotification('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar Solicitação';
            }
        });

        async function sendDataToBroker(data) {
            const endpoint = API_ENDPOINTS.FORM_SUBMIT;
            console.log('Enviando dados para a corretora:', data);
            return fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data),
            });
        }

        async function fetchAPIData(url, errorMessage) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error(errorMessage, error);
                return null;
            }
        }

        const cepInput = document.getElementById('cep');
        cepInput?.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                const spinner = document.getElementById('cep-spinner');
                if (spinner) spinner.classList.remove('hidden');
                try {
                    const data = await fetchAPIData(API_ENDPOINTS.VIA_CEP(cep), 'Erro ao buscar CEP:');
                    if (data && !data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                    }
                } finally {
                    if (spinner) spinner.classList.add('hidden');
                }
            }
        });
        
        const cepPernoiteInput = document.getElementById('cep-pernoite');
        cepPernoiteInput?.addEventListener('blur', async () => {
            const cep = cepPernoiteInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                const spinner = document.getElementById('cep-pernoite-spinner');
                if (spinner) spinner.classList.remove('hidden');
                try {
                    await fetchAPIData(API_ENDPOINTS.VIA_CEP(cep), 'Erro ao buscar CEP de pernoite:');
                } finally {
                    if (spinner) spinner.classList.add('hidden');
                }
            }
        });

        const marcaSelect = document.getElementById('marca');
        const modeloSelect = document.getElementById('modelo');
        const anoSelect = document.getElementById('ano');

        async function loadMarcas() {
            if (!marcaSelect || marcaSelect.options.length > 1) return;
            const spinner = document.getElementById('marca-spinner');
            if (spinner) spinner.classList.remove('hidden');
            marcaSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const marcas = await fetchAPIData(API_ENDPOINTS.FIPE_MARCAS, 'Erro ao carregar marcas:');
                if (!marcas) {
                    marcaSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    return;
                }
                marcaSelect.innerHTML = '<option value="">Selecione a Marca</option>';
                marcas.forEach(marca => marcaSelect.add(new Option(marca.nome, marca.codigo)));
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        }

        marcaSelect?.addEventListener('change', async () => {
            const marcaId = marcaSelect.value;
            modeloSelect.disabled = true;
            anoSelect.disabled = true;
            modeloSelect.innerHTML = '<option value="">Selecione a marca</option>';
            anoSelect.innerHTML = '<option value="">Selecione o modelo</option>';
            if (!marcaId) return;
            const spinner = document.getElementById('modelo-spinner');
            if (spinner) spinner.classList.remove('hidden');
            modeloSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const data = await fetchAPIData(API_ENDPOINTS.FIPE_MODELOS(marcaId), 'Erro ao carregar modelos:');
                if (!data || !data.modelos) {
                    modeloSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    return;
                }
                modeloSelect.innerHTML = '<option value="">Selecione o Modelo</option>';
                data.modelos.forEach(modelo => modeloSelect.add(new Option(modelo.nome, modelo.codigo)));
                modeloSelect.disabled = false;
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        });

        modeloSelect?.addEventListener('change', async () => {
            const marcaId = marcaSelect.value;
            const modeloId = modeloSelect.value;
            anoSelect.disabled = true;
            anoSelect.innerHTML = '<option value="">Selecione o modelo</option>';
            if (!marcaId || !modeloId) return;
            const spinner = document.getElementById('ano-spinner');
            if (spinner) spinner.classList.remove('hidden');
            anoSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const anos = await fetchAPIData(API_ENDPOINTS.FIPE_ANOS(marcaId, modeloId), 'Erro ao carregar anos:');
                if (!anos) {
                    anoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    return;
                }
                anoSelect.innerHTML = '<option value="">Selecione o Ano</option>';
                anos.forEach(ano => anoSelect.add(new Option(ano.nome, ano.codigo)));
                anoSelect.disabled = false;
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        });
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Testimonial Carousel ---
    const testimonialTrack = document.getElementById('testimonial-track');
    if (testimonialTrack) {
        const prevBtn = document.getElementById('testimonial-prev');
        const nextBtn = document.getElementById('testimonial-next');
        const cards = testimonialTrack.querySelectorAll('.testimonial-card');
        let currentIndex = 0;
        let resizeTimeout;

        if (cards.length === 0) {
            // If there are no testimonials, hide the controls.
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            const getItemsPerPage = () => {
                if (window.innerWidth < 768) return 1;
                if (window.innerWidth < 1024) return 2;
                return 3;
            };

            const updateCarousel = () => {
                const itemsPerPage = getItemsPerPage();
                const maxIndex = Math.max(0, cards.length - itemsPerPage);

                // Clamp currentIndex to be within valid bounds
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                if (currentIndex < 0) currentIndex = 0;

                // Use offsetWidth for a more reliable integer-based width
                const cardWidth = cards[0].offsetWidth;
                const offset = -currentIndex * cardWidth;
                testimonialTrack.style.transform = `translateX(${offset}px)`;

                // Update button states
                prevBtn.disabled = currentIndex === 0;
                nextBtn.disabled = currentIndex >= maxIndex;

                prevBtn.classList.toggle('cursor-not-allowed', prevBtn.disabled);
                prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
                nextBtn.classList.toggle('cursor-not-allowed', nextBtn.disabled);
                nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
            };

            nextBtn.addEventListener('click', () => { currentIndex++; updateCarousel(); });
            prevBtn.addEventListener('click', () => { currentIndex--; updateCarousel(); });

            // Debounce resize event for better performance
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(updateCarousel, 150);
            });

            updateCarousel(); // Initial call
        }
    }
});
