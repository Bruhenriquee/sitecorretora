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
    const QuoteForm = (() => {
        const form = document.getElementById('quote-form');
        if (!form) return { init: () => console.warn('Quote form not found.') };

        // --- 1. DOM Elements & State ---
        const DOM = {
            form,
            fieldset: document.getElementById('quote-fieldset'),
            privacyConsent: document.getElementById('privacy-consent'),
            progressBar: document.getElementById('progress-bar'),
            steps: Array.from(document.querySelectorAll('.form-step')),
            nextBtn: document.getElementById('next-btn'),
            prevBtn: document.getElementById('prev-btn'),
            submitBtn: document.getElementById('submit-quote'),
            resultDiv: document.getElementById('quote-result'),
            recalculateBtn: document.getElementById('recalculate-btn'),
            whatsappRedirectBtn: document.getElementById('whatsapp-redirect-btn'),
            condutorFields: document.getElementById('principal-condutor-fields'),
            quoteCard: document.getElementById('quote-card'),
            stepTitle: document.getElementById('step-title'),
            stepSummary: document.getElementById('step-summary'), toastContainer: document.getElementById('toast-container'), reviewContainer: document.getElementById('review-summary'),
        };

        const state = {
            currentStep: 1,
            totalSteps: 5,
            selectedInsuranceType: '',
            formData: {},
        };

        // --- 2. Configuration ---
        const API_ENDPOINTS = {
            VIA_CEP: (cep) => `https://viacep.com.br/ws/${cep}/json/`,
            FIPE_MARCAS: 'https://parallelum.com.br/fipe/api/v1/carros/marcas',
            FIPE_MODELOS: (marcaId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos`,
            FIPE_ANOS: (marcaId, modeloId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos/${modeloId}/anos`,
            FORM_SUBMIT: 'https://formspree.io/f/myzdyybp',
        };

        const REQUIRED_FIELDS = {
            1: ['insurance-type'],
            2: ['nome', 'cpf', 'nascimento', 'telefone', 'email'],
            3: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
            4: {
                auto: ['marca', 'modelo', 'ano', 'chassi', 'cep-pernoite', 'proprietario-condutor'],
                residencial: ['tipo-imovel', 'finalidade-imovel', 'tipo-construcao', 'area-construida', 'valor-imovel', 'valor-conteudo'],
                vida: ['profissao', 'renda-mensal', 'capital-segurado'],
                consorcio: ['tipo-consorcio', 'valor-carta-credito', 'prazo-desejado'],
            },
        };

        const Masks = {
            formatCPF: (value) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
            formatPhone: (value) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'),
            formatCEP: (value) => value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
            formatCurrency: (value) => {
                let numStr = value.replace(/\D/g, '');
                if (numStr === '') return '';
                const num = parseFloat(numStr) / 100;
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
            }
        };
        // --- 3. Core Logic (Validation, State, Navigation) ---
        const Validation = {
            email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            cpf: (v) => {
                const cpf = v.replace(/\D/g, '');
                if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
                let sum = 0, rest;
                for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
                rest = (sum * 10) % 11;
                if (rest === 10 || rest === 11) rest = 0;
                if (rest !== parseInt(cpf.substring(9, 10))) return false;
                sum = 0;
                for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
                rest = (sum * 10) % 11;
                if (rest === 10 || rest === 11) rest = 0;
                return rest === parseInt(cpf.substring(10, 11));
            },
            telefone: (v) => v.replace(/\D/g, '').length === 11,
            required: (v) => v.trim() !== '',
            date: (v) => v && !isNaN(new Date(v).getTime()),
        };

        const validateField = (input, showFeedback = true) => {
            if (!input || input.offsetParent === null) return true;


            const id = input.id || input.name;
            const value = input.value;
            // Corrected validation logic to properly identify dynamic required fields
            let requiredFieldsForStep = REQUIRED_FIELDS[state.currentStep];
            if (typeof requiredFieldsForStep === 'object' && !Array.isArray(requiredFieldsForStep)) {
                requiredFieldsForStep = requiredFieldsForStep[state.selectedInsuranceType] || [];
            }
            const isRequired = requiredFieldsForStep && requiredFieldsForStep.includes(id);
            const validationType = input.dataset.validate;
            let isValid = true;
            let errorMessage = '';

            if (input.type === 'radio' && isRequired) {
                isValid = form.querySelector(`input[name="${input.name}"]:checked`) !== null;
                errorMessage = 'Por favor, selecione uma opção.';
            } else if (isRequired && !Validation.required(value)) {
                isValid = false;
                errorMessage = 'Este campo é obrigatório.';
            } else if (validationType && value && Validation[validationType] && !Validation[validationType](value)) {
                isValid = false;
                errorMessage = `Formato de ${validationType} inválido.`;
            }

            if (showFeedback) UIManager.setFieldFeedback(input, isValid, errorMessage);
            return isValid;
        };

        const validateStep = (stepNumber, showFeedback = true) => {
            let fields = REQUIRED_FIELDS[stepNumber];
            if (typeof fields === 'object' && !Array.isArray(fields)) {
                fields = fields[state.selectedInsuranceType] || [];
            }
            
            if (!fields) return true; // If no fields are defined for the step, it's valid.

            if (stepNumber === 4 && state.selectedInsuranceType === 'auto') {
                if (form.querySelector('input[name="proprietario-condutor"]:checked')?.value === 'nao') {
                    fields = [...fields, 'condutor-nome', 'condutor-cpf', 'condutor-nascimento'];
                }
            }

            return fields.every(id => validateField(document.getElementById(id), showFeedback));
        };

        const updateState = (newState) => {
            // 1. Atualiza o estado
            Object.assign(state, newState); 
            // 2. Renderiza a UI com base no NOVO estado
            UIManager.render(); 
        };

        const handleNext = () => {
            if (!validateStep(state.currentStep, true)) {
                UIManager.showNotification('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            if (state.currentStep < state.totalSteps) {
                // Apenas atualiza o estado. A renderização será chamada por updateState.
                updateState({ currentStep: state.currentStep + 1 }); 
            }
        };

        const handlePrev = () => {
            if (state.currentStep > 1) {
                updateState({ currentStep: state.currentStep - 1 });
            }
        };

        // --- 4. UI Manager ---
        const UIManager = {
            render() {
                this.updateProgressBar();
                this.updateStepHeader();
                this.showCurrentStep();
                this.updateNavButtons();
                if (state.currentStep === state.totalSteps) {
                    this.generateReviewSummary();
                }
            },
            showCurrentStep() {
                DOM.steps.forEach(step => {
                    const stepNumber = parseInt(step.dataset.step, 10);
                    const insuranceType = step.dataset.insuranceType;
                    const isVisible = stepNumber === state.currentStep && (!insuranceType || insuranceType === state.selectedInsuranceType);
                    step.classList.toggle('hidden', !isVisible);
                });
            },
            updateProgressBar() {
                const progress = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
                DOM.progressBar.style.width = `${progress}%`;
            },
            updateStepHeader() {
                const typeName = state.selectedInsuranceType ? state.selectedInsuranceType.charAt(0).toUpperCase() + state.selectedInsuranceType.slice(1) : '';
                const titles = {
                    1: "1. Qual seguro você precisa?",
                    2: "2. Seus Dados Pessoais",
                    3: "3. Seu Endereço",
                    4: `4. Detalhes do Seguro ${typeName}`,
                    5: "5. Revise sua Solicitação"
                };
                DOM.stepTitle.textContent = titles[state.currentStep] || '';
                DOM.stepSummary.textContent = state.currentStep > 1 && typeName ? `Seguro: ${typeName}` : '';
            },
            updateNavButtons() {
                DOM.prevBtn.classList.toggle('hidden', state.currentStep === 1);
                DOM.nextBtn.classList.toggle('hidden', state.currentStep === state.totalSteps);
                DOM.submitBtn.classList.toggle('hidden', state.currentStep !== state.totalSteps);
                const isStepValid = validateStep(state.currentStep, false);
                DOM.nextBtn.disabled = !isStepValid;
                DOM.nextBtn.classList.toggle('opacity-50', !isStepValid);
                DOM.nextBtn.classList.toggle('cursor-not-allowed', !isStepValid);
            },
            setFieldFeedback(input, isValid, message) {
                const errorDiv = input.closest('div')?.querySelector('.error-message');
                input.classList.toggle('field-valid', isValid);
                input.classList.toggle('field-invalid', !isValid);
                if (errorDiv) {
                    errorDiv.textContent = isValid ? '' : message;
                    errorDiv.classList.toggle('hidden', isValid);
                }
            },
            showNotification(message, type = 'error') {
                if (!DOM.toastContainer) return;
                const toast = document.createElement('div');
                toast.className = `p-4 text-white rounded-lg shadow-lg flex items-center gap-3 ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`;
                toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} text-xl"></i><span>${message}</span>`;
                toast.style.animation = 'toast-in 0.5s ease';
                DOM.toastContainer.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'toast-out 0.5s ease forwards';
                    toast.addEventListener('animationend', () => toast.remove());
                }, 5000);
            },
            generateReviewSummary() {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                const getSelectText = (id) => document.getElementById(id)?.options[document.getElementById(id)?.selectedIndex]?.text || 'Não informado';

                const createSection = (title, step, content) => `
                    <div class="review-section border-b pb-4 mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="text-lg font-semibold text-gray-700">${title}</h4>
                            <button type="button" class="edit-step-btn text-sm text-blue-600 hover:underline" data-step-target="${step}">Editar</button>
                        </div>
                        <div class="text-gray-600 space-y-1 text-sm">${content}</div>
                    </div>`;

                let detailsHtml = '';
                switch (state.selectedInsuranceType) {
                    case 'auto':
                        detailsHtml = `
                            <p><strong>Veículo:</strong> ${getSelectText('marca')} ${getSelectText('modelo')} (${getSelectText('ano')})</p>
                            <p><strong>Chassi:</strong> ${data.chassi || 'Não informado'}</p>
                            <p><strong>Proprietário é o condutor:</strong> ${data['proprietario-condutor'] || 'Não informado'}</p>
                        `;
                        break;
                    case 'vida':
                        detailsHtml = `
                            <p><strong>Profissão:</strong> ${data.profissao || 'Não informado'}</p>
                            <p><strong>Renda Mensal:</strong> ${getSelectText('renda-mensal')}</p>
                            <p><strong>Capital Segurado Desejado:</strong> ${getSelectText('capital-segurado')}</p>
                        `;
                        break;
                    case 'residencial':
                         detailsHtml = `
                            <p><strong>Tipo de Imóvel:</strong> ${getSelectText('tipo-imovel')}</p>
                            <p><strong>Valor Reconstrução:</strong> ${data['valor-imovel'] || 'Não informado'}</p>
                            <p><strong>Valor Conteúdo:</strong> ${data['valor-conteudo'] || 'Não informado'}</p>
                         `;
                        break;
                    case 'consorcio':
                        detailsHtml = `
                            <p><strong>Tipo de Consórcio:</strong> ${getSelectText('tipo-consorcio')}</p>
                            <p><strong>Valor da Carta de Crédito:</strong> ${getSelectText('valor-carta-credito')}</p>
                            <p><strong>Prazo (meses):</strong> ${data['prazo-desejado'] || 'Não informado'}</p>
                        `;
                        break;
                }

                DOM.reviewContainer.innerHTML = `
                    ${createSection('Dados Pessoais', 2, `<p><strong>Nome:</strong> ${data.nome}</p><p><strong>Email:</strong> ${data.email}</p>`)}
                    ${createSection('Endereço', 3, `<p>${data.rua}, ${data.numero} - ${data.cidade}/${data.estado}</p>`)}
                    ${createSection('Detalhes do Seguro', 4, detailsHtml)}
                `;
            },
            reset() {
                form.reset();
                DOM.fieldset.disabled = true;
                DOM.resultDiv.classList.add('hidden');
                DOM.fieldset.classList.remove('hidden');
                document.querySelectorAll('.insurance-type-card').forEach(c => c.classList.remove('border-blue-500', 'bg-blue-50'));
                DOM.quoteCard.className = DOM.quoteCard.className.replace(/border-(blue|orange|red|green)-500/g, 'border-transparent');
                updateState({ currentStep: 1, selectedInsuranceType: '' });
            }
        };

        // --- 5. API & Async Operations ---
        const API = {
            async fetch(url, errorMessage) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return await response.json();
                } catch (error) {
                    console.error(errorMessage, error);
                    UIManager.showNotification('Erro de comunicação com o servidor.');
                    return null;
                }
            },
            async getAddress(cep) {
                const cepSpinner = document.getElementById('cep-spinner');
                if (cepSpinner) cepSpinner.classList.remove('hidden');

                const data = await this.fetch(API_ENDPOINTS.VIA_CEP(cep), 'Erro ao buscar CEP:');
                if (data && !data.erro) {
                    form.rua.value = data.logradouro;
                    form.bairro.value = data.bairro;
                    form.cidade.value = data.localidade;
                    form.estado.value = data.uf;
                    form.numero.focus(); // Move o foco para o campo de número
                }
                if (cepSpinner) cepSpinner.classList.add('hidden');
            },
            async getFipeData(endpoint, selectId, placeholder) {
                const select = document.getElementById(selectId);
                select.disabled = true;
                select.innerHTML = `<option value="">Carregando...</option>`;
                const data = await this.fetch(endpoint, `Erro ao carregar ${selectId}`);
                select.innerHTML = `<option value="">${placeholder}</option>`;
                if (data) {
                    const items = data.modelos || data; // API da FIPE tem estruturas diferentes
                    items.forEach(item => select.add(new Option(item.nome, item.codigo)));
                    select.disabled = false;
                }
            },
            async submitForm() {
                DOM.submitBtn.disabled = true;
                DOM.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                data.insuranceType = state.selectedInsuranceType;

                // Formatando o corpo do e-mail para ser legível
                const getSelectText = (name) => form.querySelector(`[name="${name}"]`)?.options[form.querySelector(`[name="${name}"]`).selectedIndex]?.text || 'Não informado';
                const insuranceTypeName = { auto: 'Automóvel', vida: 'de Vida', residencial: 'Residencial', consorcio: 'Consórcio' }[data.insuranceType];
                const formatDate = (dateStr) => dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado';
                
                const personalDataSection = `
**DADOS DO CLIENTE**
- **Nome:** ${data.nome || 'Não informado'}
- **Email:** ${data.email || 'Não informado'}
- **Telefone:** ${data.telefone || 'Não informado'}
- **CPF:** ${data.cpf || 'Não informado'}
- **Data de Nascimento:** ${formatDate(data.nascimento)}
- **Gênero:** ${data.genero || 'Não informado'}
- **Estado Civil:** ${data['estado-civil'] || 'Não informado'}
                `;

                const addressSection = `
**ENDEREÇO**
- **CEP:** ${data.cep || 'Não informado'}
- **Logradouro:** ${data.rua || 'Não informado'}, Nº ${data.numero || 'S/N'}
- **Complemento:** ${data.complemento || 'Nenhum'}
- **Bairro:** ${data.bairro || 'Não informado'}
- **Cidade/UF:** ${data.cidade || 'Não informado'}/${data.estado || 'Não informado'}
                `;

                let detailsSection = '';
                if (data.insuranceType === 'auto') {
                    let condutorSection = `\n- **Proprietário é o Principal Condutor?** ${data['proprietario-condutor'] === 'sim' ? 'Sim' : 'Não'}`;
                    if (data['proprietario-condutor'] === 'nao') {
                        condutorSection += `\n- **Nome do Condutor:** ${data['condutor-nome'] || 'Não informado'}\n- **CPF do Condutor:** ${data['condutor-cpf'] || 'Não informado'}\n- **Nascimento do Condutor:** ${formatDate(data['condutor-nascimento'])}`;
                    }
                    detailsSection = `\n**DADOS DO VEÍCULO**\n- **Marca:** ${getSelectText('marca')}\n- **Modelo:** ${getSelectText('modelo')}\n- **Ano/Modelo:** ${getSelectText('ano')}\n- **Chassi:** ${data.chassi || 'Não informado'}\n- **Placa:** ${data.placa || 'Não informado'}\n- **Tipo de Uso:** ${getSelectText('tipo-uso')}\n- **CEP de Pernoite:** ${data['cep-pernoite'] || 'Não informado'}\n- **Classe de Bônus:** ${getSelectText('classe-bonus')}${condutorSection}`;
                } else if (data.insuranceType === 'vida') {
                    detailsSection = `\n**DADOS DO SEGURO DE VIDA**\n- **Profissão:** ${data.profissao || 'Não informado'}\n- **Renda Mensal:** ${getSelectText('renda-mensal')}\n- **Capital Segurado Desejado:** ${getSelectText('capital-segurado')}\n- **Fumante?** ${data.fumante || 'Não informado'}\n- **Pratica esportes de risco?** ${data['esportes-radicais'] || 'Não informado'}\n- **Possui doença grave?** ${data['doencas-graves'] || 'Não informado'}`;
                } else if (data.insuranceType === 'residencial') {
                    const coberturas = Array.from(form.querySelectorAll('input[name="coberturas"]:checked')).map(cb => cb.dataset.label).join(', ') || 'Nenhuma';
                    detailsSection = `\n**DADOS DO IMÓVEL**\n- **Tipo:** ${getSelectText('tipo-imovel')}\n- **Finalidade:** ${getSelectText('finalidade-imovel')}\n- **Valor de Reconstrução:** ${data['valor-imovel'] || 'Não informado'}\n- **Valor do Conteúdo:** ${data['valor-conteudo'] || 'Não informado'}\n- **Coberturas Adicionais:** ${coberturas}`;
                } else if (data.insuranceType === 'consorcio') {
                    detailsSection = `\n**DADOS DO CONSÓRCIO**\n- **Tipo:** ${getSelectText('tipo-consorcio')}\n- **Valor da Carta de Crédito:** ${getSelectText('valor-carta-credito')}\n- **Prazo Desejado:** ${data['prazo-desejado']} meses`;
                }

                const emailBody = `
Nova Solicitação de Cotação de Seguro ${insuranceTypeName}
----------------------------------------
${personalDataSection}
----------------------------------------
${addressSection}
----------------------------------------
${detailsSection}
----------------------------------------
Este e-mail foi enviado automaticamente pelo formulário do site.
                `;

                const payload = {
                    _subject: `Cotação de Seguro ${insuranceTypeName} - ${data.nome}`,
                    _replyto: data.email,
                    "Solicitação": emailBody
                };

                try {
                    const response = await fetch(API_ENDPOINTS.FORM_SUBMIT, {
                        method: 'POST',
                        body: JSON.stringify(payload),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('Formspree response:', responseData);
                        DOM.fieldset.classList.add('hidden');
                        DOM.resultDiv.classList.remove('hidden');
                        const phone = '5518981558125';
                        const message = `Olá! Acabei de fazer uma cotação de Seguro ${insuranceTypeName} pelo site e gostaria de saber o preço.`;
                        DOM.whatsappRedirectBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                    }
                } catch (error) {
                    console.error('Erro ao enviar formulário:', error);
                    UIManager.showNotification('Ocorreu um erro ao enviar sua solicitação.');
                } finally {
                    DOM.submitBtn.disabled = false;
                    DOM.submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Solicitação';
                }
            }
        };

        // --- 6. Event Listeners & Initialization ---
        const setupEventListeners = () => {
            DOM.privacyConsent.addEventListener('change', () => {
                DOM.fieldset.disabled = !DOM.privacyConsent.checked;
            });

            form.addEventListener('input', debounce((e) => {
                const { target } = e;
                if (target.dataset.mask) {
                    const maskFunction = Masks[target.dataset.mask];
                    if (maskFunction) target.value = maskFunction(target.value);
                }
                validateField(target);
                UIManager.updateNavButtons();
            }, 300));

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (validateStep(state.currentStep, true)) {
                    API.submitForm();
                }
            });

            DOM.nextBtn.addEventListener('click', handleNext);
            DOM.prevBtn.addEventListener('click', handlePrev);
            DOM.recalculateBtn.addEventListener('click', UIManager.reset);

            form.cep.addEventListener('input', (e) => {
                const cepValue = e.target.value.replace(/\D/g, '');
                if (cepValue.length === 8) API.getAddress(cepValue);
            });

            form.querySelectorAll('.insurance-type-radio').forEach(radio => {
                radio.addEventListener('click', (e) => {
                    const type = e.target.value;
                    updateState({ selectedInsuranceType: type });
                    if (type === 'auto') API.getFipeData(API_ENDPOINTS.FIPE_MARCAS, 'marca', 'Selecione a Marca');
                    
                    document.querySelectorAll('.insurance-type-card').forEach(c => c.classList.remove('border-blue-500', 'bg-blue-50'));
                    e.target.closest('.insurance-type-option').querySelector('.insurance-type-card').classList.add('border-blue-500', 'bg-blue-50');
                });
            });

            form.marca?.addEventListener('change', (e) => {
                if (e.target.value) API.getFipeData(API_ENDPOINTS.FIPE_MODELOS(e.target.value), 'modelo', 'Selecione o Modelo');
            });

            form.modelo?.addEventListener('change', (e) => {
                if (e.target.value) API.getFipeData(API_ENDPOINTS.FIPE_ANOS(form.marca.value, e.target.value), 'ano', 'Selecione o Ano');
            });

            form.querySelectorAll('input[name="proprietario-condutor"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    DOM.condutorFields.classList.toggle('hidden', e.target.value !== 'nao');
                    UIManager.updateNavButtons();
                });
            });

            DOM.reviewContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('edit-step-btn')) {
                    const targetStep = parseInt(e.target.dataset.stepTarget, 10);
                    updateState({ currentStep: targetStep });
                }
            });
        };

        const init = () => {
            DOM.fieldset.disabled = !DOM.privacyConsent.checked;
            setupEventListeners();
            UIManager.render();
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
