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

    // --- Infinite Carousel for Partners ---
    function initializeInfiniteCarousel() {
        const carousel = document.getElementById('insurance-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => {
                carousel.style.animationPlayState = 'paused';
            });
            carousel.addEventListener('mouseleave', () => {
                carousel.style.animationPlayState = 'running';
            });
        }
    }
    initializeInfiniteCarousel();

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

    // --- Services Accordion ---
    function initializeServicesAccordion() {
        document.querySelectorAll('.service-toggle-btn').forEach(button => {
            button.addEventListener('click', () => {
                const currentCard = button.closest('.service-card');
                const currentDetails = currentCard.querySelector('.service-details');
                const currentIcon = button.querySelector('.fa-chevron-down');
                const isOpening = !currentDetails.style.maxHeight || currentDetails.style.maxHeight === '0px';

                // Fecha todos os outros acordeões abertos
                document.querySelectorAll('.service-card').forEach(otherCard => {
                    if (otherCard !== currentCard) {
                        const otherDetails = otherCard.querySelector('.service-details');
                        const otherIcon = otherCard.querySelector('.fa-chevron-down');
                        otherDetails.style.maxHeight = '0px';
                        otherDetails.style.paddingTop = '0';
                        otherIcon.classList.remove('rotate-180');
                    }
                });

                // Abre ou fecha o acordeão clicado
                if (isOpening) {
                    currentDetails.style.paddingTop = '1.5rem'; // Adiciona padding-top (equivale a mb-6)
                    currentDetails.style.maxHeight = currentDetails.scrollHeight + 'px';
                    currentIcon.classList.add('rotate-180');
                } else {
                    currentDetails.style.maxHeight = '0px';
                    currentDetails.style.paddingTop = '0';
                    currentIcon.classList.remove('rotate-180');
                }
            });
        });
    }
    initializeServicesAccordion();

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
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                contactSuccess.classList.remove('hidden');
                setTimeout(() => contactSuccess.classList.add('hidden'), 5000);
            }, 2000);
        });
    }

    // --- Contact Form Enhancements ---
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailLink = document.getElementById('contact-email-link');

    if (copyEmailBtn && emailLink) {
        copyEmailBtn.addEventListener('click', () => {
            const email = emailLink.textContent;
            navigator.clipboard.writeText(email).then(() => {
                const icon = copyEmailBtn.querySelector('i');
                icon.classList.remove('far', 'fa-copy');
                icon.classList.add('fas', 'fa-check', 'text-green-500');

                setTimeout(() => {
                    icon.classList.remove('fas', 'fa-check', 'text-green-500');
                    icon.classList.add('far', 'fa-copy');
                }, 2000);
            }).catch(err => console.error('Falha ao copiar e-mail: ', err));
        });
    }

    // --- Debounce utility ---
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- Módulo do Formulário de Cotação ---
    const QuoteForm = (function() {
        const quoteForm = document.getElementById('quote-form');
        if (!quoteForm) return { init: () => {} }; // Retorna um objeto com um método init vazio se o formulário não existir

        // Centralize DOM element selection for better performance and maintainability
        const domElements = {
            fieldset: document.getElementById('quote-fieldset'),
            privacyConsent: document.getElementById('privacy-consent'),
            progressBar: document.getElementById('progress-bar'),
            steps: Array.from(document.querySelectorAll('.form-step')),
            nextBtn: document.getElementById('next-btn'),
            prevBtn: document.getElementById('prev-btn'),
            submitBtn: document.getElementById('submit-quote'),
            quoteResultDiv: document.getElementById('quote-result'),
            recalculateBtn: document.getElementById('recalculate-btn'),
            whatsappRedirectBtn: document.getElementById('whatsapp-redirect-btn'),
            condutorFields: document.getElementById('principal-condutor-fields'),
            quoteCard: document.getElementById('quote-card'),
            stepTitle: document.getElementById('step-title'),
            stepSummary: document.getElementById('step-summary'),
            toastContainer: document.getElementById('toast-container'),
            marcaSelect: document.getElementById('marca'),
            modeloSelect: document.getElementById('modelo'),
            anoSelect: document.getElementById('ano')
        };

        // Estado do formulário
        let state = {
            currentStep: 1,
            totalSteps: 3, // Valor inicial, será atualizado
            selectedInsuranceType: ''
        };
        // --- Notification System ---
        const UIManager = {
            showNotification(message, type = 'error') {
                if (!domElements.toastContainer) return;
                const toast = document.createElement('div');
                const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
                const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
                toast.className = `p-4 text-white rounded-lg shadow-lg flex items-center gap-3 ${bgColor}`;
                toast.style.animation = 'toast-in 0.5s ease';
                toast.innerHTML = `<i class="fas ${icon} text-xl"></i><span>${message}</span>`;
                domElements.toastContainer.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'toast-out 0.5s ease forwards';
                    toast.addEventListener('animationend', () => toast.remove());
                }, 5000);
            },
            updateProgressBar() {
                const progress = (state.currentStep / state.totalSteps) * 100;
                if (domElements.progressBar) domElements.progressBar.style.width = `${progress}%`;
            },
            updateStepHeader() {
                const titles = {
                    1: "1. Qual seguro você precisa?",
                    2: "2. Seus Dados Pessoais",
                    3: "3. Seu Endereço",
                    4: `4. Detalhes do Seguro ${state.selectedInsuranceType ? `(${state.selectedInsuranceType.charAt(0).toUpperCase() + state.selectedInsuranceType.slice(1)})` : ''}`,
                    5: "5. Revise sua Solicitação"
                };
                if (domElements.stepTitle) domElements.stepTitle.textContent = titles[state.currentStep] || '';
                if (domElements.stepSummary) {
                    domElements.stepSummary.textContent = state.currentStep > 1 && state.selectedInsuranceType ? `Seguro: ${state.selectedInsuranceType.charAt(0).toUpperCase() + state.selectedInsuranceType.slice(1)}` : '';
                }
            }
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
            let numStr = value.replace(/\D/g, '');
            if (numStr === '') return ''; // Retorna vazio se o usuário apagar tudo
            const num = parseFloat(numStr) / 100;
            const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
            return formatted;
        }

        // Substituir funções duplicadas por chamadas aos módulos já criados
        document.getElementById('cpf')?.addEventListener('input', (e) => applyMask(e, formatCPF));
        document.getElementById('condutor-cpf')?.addEventListener('input', (e) => applyMask(e, formatCPF));
        document.getElementById('telefone')?.addEventListener('input', (e) => { applyMask(e, formatPhone); validateField(e.target, 'telefone'); });
        document.getElementById('cep')?.addEventListener('input', (e) => applyMask(e, formatCEP));
        document.getElementById('cep-pernoite')?.addEventListener('input', (e) => applyMask(e, formatCEP));
        const currencyFieldIds = ['valor-imovel', 'valor-conteudo', 'renda-mensal', 'capital-segurado', 'valor-carta-credito'];
        currencyFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.type = 'text';
                field.setAttribute('inputmode', 'numeric');
                field.addEventListener('input', (e) => applyMask(e, formatCurrency));
            }
        });

        // --- API Endpoints ---
        const API_ENDPOINTS = {
            VIA_CEP: (cep) => `https://viacep.com.br/ws/${cep}/json/`,
            FIPE_MARCAS: 'https://parallelum.com.br/fipe/api/v1/carros/marcas',
            FIPE_MODELOS: (marcaId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos`,
            FIPE_ANOS: (marcaId, modeloId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos/${modeloId}/anos`,
            FORM_SUBMIT: 'https://formspree.io/f/myzdyybp'
        };
        const showStep = () => {
            const currentVisibleStep = domElements.steps.find(s => !s.classList.contains('hidden'));
            const nextStep = domElements.steps.find(s => {
                const stepData = parseInt(s.dataset.step);
                const isTypeSpecificStep = s.dataset.insuranceType;
                if (stepData !== state.currentStep) return false;
                if (isTypeSpecificStep && isTypeSpecificStep !== state.selectedInsuranceType) return false;
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

            domElements.prevBtn.classList.toggle('hidden', state.currentStep === 1);
            domElements.nextBtn.classList.toggle('hidden', state.currentStep === state.totalSteps);
            domElements.submitBtn.classList.toggle('hidden', state.currentStep !== state.totalSteps);
            if (state.currentStep === state.totalSteps) {
                generateReviewSummary();
            }

            // Habilita ou desabilita o botão de avançar com base na validação da etapa atual
            const isStepValid = validateStep(state.currentStep, false); // false para não mostrar erros ainda
            domElements.nextBtn.disabled = !isStepValid;
            domElements.nextBtn.classList.toggle('opacity-50', !isStepValid);
            domElements.nextBtn.classList.toggle('cursor-not-allowed', !isStepValid);

            UIManager.updateStepHeader();
            UIManager.updateProgressBar();
        };

        const requiredFields = {
            1: ['insurance-type'],
            2: ['nome', 'cpf', 'nascimento', 'telefone', 'email', 'genero', 'estado-civil'],
            3: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
            4: {
                auto: ['marca', 'modelo', 'ano', 'chassi', 'tipo-uso', 'cep-pernoite', 'classe-bonus', 'garagem-casa', 'garagem-trabalho', 'proprietario-condutor'],
                residencial: ['tipo-imovel', 'finalidade-imovel', 'tipo-construcao', 'area-construida', 'valor-imovel', 'valor-conteudo'],
                vida: ['capital-segurado', 'profissao', 'renda-mensal'],
                consorcio: ['tipo-consorcio', 'valor-carta-credito']
            }
        };

        const validateStep = (stepNumber, showErrors = true) => {
            const stepRules = requiredFields[stepNumber];
            if (!stepRules) return true;
            let requiredIds = [];
            if (Array.isArray(stepRules)) {
                requiredIds = [...stepRules];
            } else if (typeof stepRules === 'object' && state.selectedInsuranceType && stepRules[state.selectedInsuranceType]) {
                requiredIds = [...stepRules[state.selectedInsuranceType]];
            }
            if (stepNumber === 4 && state.selectedInsuranceType === 'auto') {
                const ownerIsNotDriver = document.querySelector('input[name="proprietario-condutor"][value="nao"]:checked');
                if (ownerIsNotDriver) {
                    requiredIds.push('condutor-nome', 'condutor-cpf', 'condutor-nascimento', 'condutor-genero', 'condutor-estado-civil');
                }
            }
            if (requiredIds.length === 0) return true;
            let allFieldsValid = true;
            requiredIds.forEach(id => {
                const input = document.getElementById(id);
                // Para radio buttons, verifica se um da mesma família (name) foi selecionado
                if (input && input.type === 'radio') {
                    const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                    const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isChecked) {
                        allFieldsValid = false;
                        // Destaca o container do grupo de radios, se houver
                        const groupContainer = input.closest('div.flex');
                        groupContainer?.parentElement.classList.add('field-invalid-group'); // Adiciona uma classe para estilização
                    }
                    return; // Pula para o próximo ID
                }

                if (!input || input.offsetParent === null) return; // Ignora campos que não estão visíveis na tela

                const wrapper = input.closest('.relative, .field-wrapper');
                const errorDiv = input.closest('div')?.querySelector('.error-message');
                if (showErrors) {
                    if (errorDiv) errorDiv.classList.add('hidden');
                    input.classList.remove('field-invalid');
                }

                if (!input.value.trim()) {
                    allFieldsValid = false;
                    if (showErrors) {
                        input.classList.add('field-invalid');
                        if (errorDiv) {
                            errorDiv.textContent = 'Este campo é obrigatório.';
                            errorDiv.classList.remove('hidden');
                        }
                    }
                }
                // Executa a validação específica do campo (CPF, email, etc.) se ele tiver valor
                if (input.value.trim() && input.dataset.validate) {
                    if (!validateField(input, input.dataset.validate)) allFieldsValid = false;
                }
            });
            return allFieldsValid;
        };

        const validateField = (input, type) => {
            if (!input) return;
            const wrapper = input.closest('.relative');
            const errorDiv = wrapper?.querySelector('.error-message');
            let isValid = false;
            let isRequired = input.required;
            let errorMessage = '';

            // Limpa feedback anterior
            // wrapper?.querySelector('.validation-icon')?.remove(); // Não é mais necessário remover, apenas controlar a classe do input
            input.classList.remove('field-invalid', 'field-valid');
            if (errorDiv) errorDiv.classList.add('hidden');

            const value = input.value.trim();

            // Se o campo é obrigatório e está vazio, a validação de etapa já cuida disso.
            if (!value.trim() && !isRequired) {
                return true; // Campo não obrigatório e vazio é válido.
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

            if (isValid && value) { // Só mostra feedback positivo se houver valor
                input.classList.add('field-valid');
            } else {
                input.classList.add('field-invalid');
                if (errorDiv) {
                    errorDiv.textContent = errorMessage;
                    errorDiv.classList.remove('hidden');
                }
            }
            return isValid;
        };

        // Adiciona validação em tempo real com debounce
        // A validação de telefone já está no evento de input com a máscara
        document.getElementById('cpf')?.addEventListener('input', debounce((e) => validateField(e.target, 'cpf'), 500));
        document.getElementById('condutor-cpf')?.addEventListener('input', debounce((e) => validateField(e.target, 'cpf'), 500));
        document.getElementById('email')?.addEventListener('input', debounce((e) => validateField(e.target, 'email'), 500));

        const generateReviewSummary = () => {
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
                    } else if (el.tagName === 'SELECT' && el.selectedIndex >= 0) {
                        // Pega o texto da opção selecionada para melhor legibilidade no resumo
                        data[key] = el.options[el.selectedIndex].text;
                    } else {
                        data[key] = el.value;
                    }
                });
                return data;
            };
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

            const getInsuranceDetailsHtml = (type, formData) => {
                const detailsMap = {
                    auto: d => `<p><strong>Veículo:</strong> ${d.marca || ''} ${d.modelo || ''} (${d.ano || ''})</p><p><strong>Uso:</strong> ${d['tipo-uso'] || ''}</p><p><strong>Bônus:</strong> Classe ${d['classe-bonus'] || ''}</p>`,
                    residencial: d => `<p><strong>Imóvel:</strong> ${d['tipo-imovel'] || ''} (${d['finalidade-imovel'] || ''})</p><p><strong>Valor Reconstrução:</strong> ${d['valor-imovel'] || ''}</p><p><strong>Valor Conteúdo:</strong> ${d['valor-conteudo'] || ''}</p>`,
                    vida: d => `<p><strong>Capital Segurado:</strong> ${d['capital-segurado'] || ''}</p><p><strong>Profissão:</strong> ${d.profissao || ''}</p>`,
                    consorcio: d => `<p><strong>Tipo:</strong> ${d['tipo-consorcio'] || ''}</p><p><strong>Carta de Crédito:</strong> ${d['valor-carta-credito'] || ''}</p><p><strong>Prazo:</strong> ${d['prazo-desejado'] || ''} meses</p>`
                };
                return detailsMap[type] ? detailsMaptype : '';
            };

            const insuranceDetailsHtml = getInsuranceDetailsHtml(state.selectedInsuranceType, data);
            if (insuranceDetailsHtml) {
                const typeName = { auto: 'Automóvel', residencial: 'Residencial', vida: 'de Vida', consorcio: 'Consórcio' }[state.selectedInsuranceType] || 'Geral';
                const insuranceTitle = `Detalhes do Seguro ${typeName}`;
                html += createSection(insuranceTitle, 4, insuranceDetailsHtml);
            }
 
             reviewContainer.innerHTML = html;
             reviewContainer.querySelectorAll('.edit-step-btn').forEach(addEditButtonListener);
         };

        const provideInputFeedback = (event) => {
            const input = event.target;
            if (!input.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"], select, textarea')) {
                return;
            }
            const wrapper = input.closest('.relative');
            const errorDiv = input.closest('div')?.querySelector('.error-message');
            
            // Limpa feedback de erro anterior
            wrapper?.querySelector('.validation-icon')?.remove();
            input.classList.remove('field-invalid', 'field-valid');

            if (errorDiv && !errorDiv.classList.contains('hidden')) {
                errorDiv.classList.add('hidden');
            }

            if (input.value.trim() !== '') {
                input.classList.add('field-valid');
            }

            // Revalida a etapa para habilitar/desabilitar o botão de avançar
            const isStepValid = validateStep(state.currentStep, false);
            domElements.nextBtn.disabled = !isStepValid;
            domElements.nextBtn.classList.toggle('opacity-50', !isStepValid);
            domElements.nextBtn.classList.toggle('cursor-not-allowed', !isStepValid);
        };

        domElements.privacyConsent.addEventListener('change', () => {
            domElements.fieldset.disabled = !domElements.privacyConsent.checked;
        });

        document.querySelectorAll('.insurance-type-radio').forEach(radio => {
            radio.addEventListener('click', () => {
                state.selectedInsuranceType = radio.value;
                state.totalSteps = 5; // Adicionada a etapa de revisão

                // Atualiza a cor da borda do card
                const colorMap = {
                    auto: 'border-blue-500',
                    residencial: 'border-orange-500',
                    vida: 'border-red-500',
                    consorcio: 'border-green-500'
                };
                if (domElements.quoteCard) {
                    domElements.quoteCard.className = domElements.quoteCard.className.replace(/border-(blue|orange|red|green)-500/g, '');
                    domElements.quoteCard.classList.add(colorMap[radio.value] || 'border-transparent');
                }

                document.querySelectorAll('.insurance-type-card').forEach(card => card.classList.remove('border-blue-500', 'bg-blue-50'));
                radio.closest('.insurance-type-option').querySelector('.insurance-type-card').classList.add('border-blue-500', 'bg-blue-50');
                if (state.selectedInsuranceType === 'auto') loadMarcas();
            });
        });

        const addEditButtonListener = (button) => {
            button.addEventListener('click', (e) => {
                const targetStep = parseInt(e.target.dataset.stepTarget, 10);
                if (!isNaN(targetStep)) {
                    state.currentStep = targetStep;
                    showStep();
                }
            });
        };

        const initializeConditionalFields = () => {
            const condutorRadios = document.querySelectorAll('input[name="proprietario-condutor"]');

            if (!domElements.condutorFields || condutorRadios.length === 0) {
                return;
            }

            const toggleCondutorFields = (event) => {
                const shouldShow = event.target.value === 'nao';
                domElements.condutorFields.classList.toggle('hidden', !shouldShow);
            };

            condutorRadios.forEach(radio => {
                radio.addEventListener('change', toggleCondutorFields);
            });
        };

        initializeConditionalFields();

        domElements.nextBtn.addEventListener('click', () => {
            if (state.currentStep === 1 && !state.selectedInsuranceType) {
                UIManager.showNotification('Por favor, selecione um tipo de seguro.');
                return;
            }
            if (!validateStep(state.currentStep, true)) { // true para mostrar os erros
                UIManager.showNotification('Por favor, preencha todos os campos obrigatórios destacados.');
                return;
            }
            if (state.currentStep < state.totalSteps) {
                state.currentStep++;
                showStep();
            }
        });

        domElements.prevBtn.addEventListener('click', () => {
            if (state.currentStep > 1) {
                state.currentStep--;
                showStep();
            }
        });

        const resetForm = () => {
            domElements.quoteResultDiv.classList.add('hidden');
            domElements.fieldset.classList.remove('hidden');
            quoteForm.reset();

            // Clear all visual feedback and error messages
            quoteForm.querySelectorAll('input, select, textarea').forEach(input => {
                input.classList.remove('field-invalid', 'field-valid');
                const errorDiv = input.closest('div')?.querySelector('.error-message');
                if (errorDiv) errorDiv.classList.add('hidden');
            });

            // Reset specific elements and state
            domElements.fieldset.disabled = true;
            domElements.privacyConsent.checked = false;
            domElements.condutorFields?.classList.add('hidden');
            document.querySelectorAll('.insurance-type-card').forEach(card => {
                card.classList.remove('border-blue-500', 'bg-blue-50');
            });

            // Manually reset FIPE fields to their initial state, as form.reset() doesn't handle this.
            if (domElements.modeloSelect) {
                domElements.modeloSelect.innerHTML = '<option value="">Selecione a marca primeiro</option>';
                domElements.modeloSelect.disabled = true;
            }
            if (domElements.anoSelect) {
                domElements.anoSelect.innerHTML = '<option value="">Selecione o modelo primeiro</option>';
                domElements.anoSelect.disabled = true;
            }

            // Reset form state variables
            state.currentStep = 1;
            state.totalSteps = 3;
            state.selectedInsuranceType = '';

            if (domElements.quoteCard) {
                domElements.quoteCard.className = domElements.quoteCard.className.replace(/border-(blue|orange|red|green)-500/g, 'border-transparent');
            }

            // Show the first step
            showStep();
        };

        domElements.recalculateBtn.addEventListener('click', resetForm);

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
                UIManager.showNotification('Por favor, corrija os campos destacados antes de enviar.');
                return;
            }
            if (!validateStep(state.currentStep, true)) {
                UIManager.showNotification('Por favor, preencha todos os campos obrigatórios destacados antes de enviar.');
                return;
            }
            domElements.submitBtn.disabled = true;
            domElements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

            const data = { insuranceType: state.selectedInsuranceType };
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

            const insuranceTypeName = { auto: 'Automóvel', vida: 'de Vida', residencial: 'Residencial', consorcio: 'Consórcio' }[state.selectedInsuranceType] || state.selectedInsuranceType;
            const personalDataSection = `\n**DADOS DO CLIENTE**\n- **Nome:** ${data.nome || 'Não informado'}\n- **Email:** ${data.email || 'Não informado'}\n- **Telefone:** ${data.telefone || 'Não informado'}\n- **CPF:** ${data.cpf || 'Não informado'}\n- **Data de Nascimento:** ${data.nascimento ? new Date(data.nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}\n- **Gênero:** ${data.genero || 'Não informado'}\n- **Estado Civil:** ${data['estado-civil'] || 'Não informado'}`;
            const addressSection = `\n**ENDEREÇO**\n- **CEP:** ${data.cep || 'Não informado'}\n- **Logradouro:** ${data.rua || 'Não informado'}, Nº ${data.numero || 'S/N'}\n- **Bairro:** ${data.bairro || 'Não informado'}\n- **Cidade/UF:** ${data.cidade || 'Não informado'}/${data.estado || 'Não informado'}`;
            let detailsSection = '';
            if (state.selectedInsuranceType === 'auto') {
                const marcaText = data.marca ? domElements.marcaSelect.options[domElements.marcaSelect.selectedIndex].text : 'Não informado';
                const modeloText = data.modelo ? domElements.modeloSelect.options[domElements.modeloSelect.selectedIndex].text : 'Não informado';
                const anoText = data.ano ? domElements.anoSelect.options[domElements.anoSelect.selectedIndex].text : 'Não informado';
                let condutorSection = `\n- **Proprietário é o Principal Condutor?** ${data['proprietario-condutor'] === 'sim' ? 'Sim' : 'Não'}`;
                if (data['proprietario-condutor'] === 'nao') {
                    condutorSection += `\n- **Nome do Principal Condutor:** ${data['condutor-nome'] || 'Não informado'}\n- **CPF do Principal Condutor:** ${data['condutor-cpf'] || 'Não informado'}`;
                }
                detailsSection = `\n**DADOS DO VEÍCULO**\n- **Marca:** ${marcaText}\n- **Modelo:** ${modeloText}\n- **Ano/Modelo:** ${anoText}\n- **Chassi:** ${data.chassi || 'Não informado'}\n- **Placa:** ${data.placa || 'Não informado'}\n- **Tipo de Uso:** ${data['tipo-uso'] || 'Não informado'}\n- **CEP de Pernoite:** ${data['cep-pernoite'] || 'Não informado'}\n- **Classe de Bônus:** ${data['classe-bonus'] || 'Não informado'}\n- **Garagem em Casa?** ${data['garagem-casa'] || 'Não informado'}\n- **Garagem no Trabalho/Estudo?** ${data['garagem-trabalho'] || 'Não informado'}${condutorSection}`;
            } else if (state.selectedInsuranceType === 'residencial') {
                const coberturas = Array.from(document.querySelectorAll('input[name="coberturas"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()).join(', ') || 'Nenhuma';
                const seguranca = Array.from(document.querySelectorAll('input[name="seguranca"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()).join(', ') || 'Nenhuma';
                detailsSection = `\n**DADOS DO IMÓVEL**\n- **Tipo de Imóvel:** ${data['tipo-imovel'] || 'Não informado'}\n- **Uso do Imóvel:** ${data['finalidade-imovel'] || 'Não informado'}\n- **Tipo de Construção:** ${data['tipo-construcao'] || 'Não informado'}\n- **Área Construída (m²):** ${data['area-construida'] || 'Não informado'}\n- **Valor de Reconstrução (R$):** ${data['valor-imovel'] || 'Não informado'}\n- **Valor dos Bens/Conteúdo (R$):** ${data['valor-conteudo'] || 'Não informado'}\n- **Coberturas Adicionais:** ${coberturas}\n- **Sistemas de Segurança:** ${seguranca}`;
            } else if (state.selectedInsuranceType === 'vida') {
                detailsSection = `\n**DADOS DO SEGURO DE VIDA**\n- **Capital Segurado Desejado (R$):** ${data['capital-segurado'] || 'Não informado'}\n- **Profissão:** ${data.profissao || 'Não informado'}\n- **Renda Mensal (R$):** ${data['renda-mensal'] || 'Não informado'}\n- **Pratica Esportes Radicais?** ${data['esportes-radicais'] || 'Não informado'}\n- **Fumante?** ${data.fumante || 'Não informado'}\n- **Histórico de Doenças Graves?** ${data['doencas-graves'] || 'Não informado'}`;
            } else if (state.selectedInsuranceType === 'consorcio') {
                detailsSection = `\n**DADOS DO CONSÓRCIO**\n- **Tipo de Consórcio:** ${data['tipo-consorcio'] || 'Não informado'}\n- **Valor da Carta de Crédito (R$):** ${data['valor-carta-credito'] || 'Não informado'}\n- **Prazo Desejado (meses):** ${data['prazo-desejado'] || 'Não informado'}`;
            }
            const emailBody = `\nNova Solicitação de Cotação de Seguro ${insuranceTypeName}\n----------------------------------------------------\n${personalDataSection}\n${addressSection}\n${detailsSection}\n----------------------------------------------------\nEste e-mail foi enviado automaticamente pelo formulário de cotação do site.\n`;
            const payload = { _subject: `Cotação de Seguro ${insuranceTypeName} - ${data.nome}`, _replyto: data.email, "Solicitação de Cotação": emailBody };

            try {
                const response = await fetch(API_ENDPOINTS.FORM_SUBMIT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error('Falha ao enviar a solicitação.');
                domElements.fieldset.classList.add('hidden');
                domElements.quoteResultDiv.classList.remove('hidden');
                const phone = '5518981558125'; // Substitua pelo seu número de WhatsApp
                const clientName = document.getElementById('nome').value.split(' ')[0] || 'Cliente';
                const message = `Olá! Acabei de fazer uma cotação pelo site em nome de ${clientName} e gostaria de saber o preço.`;
                domElements.whatsappRedirectBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            } catch (error) {
                console.error('Submission Error:', error);
                UIManager.showNotification('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
            } finally {
                domElements.submitBtn.disabled = false;
                domElements.submitBtn.innerHTML = 'Enviar Solicitação';
            }
        });

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

        async function loadMarcas() {
            if (!domElements.marcaSelect || domElements.marcaSelect.options.length > 1) return;
            const spinner = document.getElementById('marca-spinner');
            if (spinner) spinner.classList.remove('hidden');
            domElements.marcaSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const marcas = await fetchAPIData(API_ENDPOINTS.FIPE_MARCAS, 'Erro ao carregar marcas:');
                if (!marcas) {
                    domElements.marcaSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    return;
                }
                domElements.marcaSelect.innerHTML = '<option value="">Selecione a Marca</option>';
                marcas.forEach(marca => domElements.marcaSelect.add(new Option(marca.nome, marca.codigo)));
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        }

        domElements.marcaSelect?.addEventListener('change', async () => {
            const marcaId = domElements.marcaSelect.value;
            domElements.modeloSelect.disabled = true;
            domElements.anoSelect.disabled = true;
            domElements.modeloSelect.innerHTML = '<option value="">Selecione a marca</option>';
            domElements.anoSelect.innerHTML = '<option value="">Selecione o modelo</option>';
            if (!marcaId) return;
            const spinner = document.getElementById('modelo-spinner');
            if (spinner) spinner.classList.remove('hidden');
            domElements.modeloSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const data = await fetchAPIData(API_ENDPOINTS.FIPE_MODELOS(marcaId), 'Erro ao carregar modelos:');
                if (!data || !data.modelos) {
                    domElements.modeloSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    return;
                }
                domElements.modeloSelect.innerHTML = '<option value="">Selecione o Modelo</option>';
                data.modelos.forEach(modelo => domElements.modeloSelect.add(new Option(modelo.nome, modelo.codigo)));
                domElements.modeloSelect.disabled = false;
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        });

        domElements.modeloSelect?.addEventListener('change', async () => {
            const marcaId = domElements.marcaSelect.value;
            const modeloId = domElements.modeloSelect.value;
            domElements.anoSelect.disabled = true;
            domElements.anoSelect.innerHTML = '<option value="">Selecione o modelo</option>';
            if (!marcaId || !modeloId) return;
            const spinner = document.getElementById('ano-spinner');
            if (spinner) spinner.classList.remove('hidden');
            domElements.anoSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const anos = await fetchAPIData(API_ENDPOINTS.FIPE_ANOS(marcaId, modeloId), 'Erro ao carregar anos:');
                if (!anos) {
                    domElements.anoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    return;
                }
                domElements.anoSelect.innerHTML = '<option value="">Selecione o Ano</option>';
                anos.forEach(ano => domElements.anoSelect.add(new Option(ano.nome, ano.codigo)));
                domElements.anoSelect.disabled = false;
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        });

        // Método público para inicializar o formulário
        const init = () => {
            domElements.fieldset.disabled = !domElements.privacyConsent.checked;
            showStep();
        };

        return { init };
    })();

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

    function initializeTestimonialCarousel() {
        const track = document.getElementById('testimonial-track');
        if (!track) return;

        const prevBtn = document.getElementById('testimonial-prev');
        const nextBtn = document.getElementById('testimonial-next');
        const originalCards = Array.from(track.children).slice(0, track.children.length / 2); // Pega apenas os cards originais
        const totalCards = originalCards.length;

        let currentIndex = 0;
        let cardWidth = 0;

        function updateCarousel(transition = true) {
            if (transition) {
                track.style.transition = 'transform 0.5s ease-in-out';
            } else {
                track.style.transition = 'none';
            }
            cardWidth = track.children[0].offsetWidth;
            const offset = -currentIndex * cardWidth;
            track.style.transform = `translateX(${offset}px)`;
        }

        function handleNext() {
            currentIndex++;
            updateCarousel();

            if (currentIndex === totalCards) {
                setTimeout(() => {
                    currentIndex = 0;
                    updateCarousel(false);
                }, 500); // Deve ser igual à duração da transição
            }
        }

        function handlePrev() {
            if (currentIndex === 0) {
                currentIndex = totalCards;
                updateCarousel(false);
                // Força o navegador a aplicar a mudança antes de animar de volta
                setTimeout(() => {
                    currentIndex--;
                    updateCarousel();
                }, 20);
            } else {
                currentIndex--;
                updateCarousel();
            }
        }

        nextBtn.addEventListener('click', handleNext);
        prevBtn.addEventListener('click', handlePrev);

        window.addEventListener('resize', debounce(() => {
            updateCarousel(false);
        }, 150));

        updateCarousel(false);
    }

    initializeTestimonialCarousel();

    // Inicializa o formulário de cotação
    QuoteForm.init();
});
