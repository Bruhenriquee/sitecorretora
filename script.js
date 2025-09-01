document.addEventListener('DOMContentLoaded', () => {
    // --- Inject Animation Styles ---
    const injectAnimationStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(15px); }
              to { opacity: 1; transform: translateY(0); }
            }
    
            @keyframes fadeOut {
              from { opacity: 1; transform: translateY(0); }
              to { opacity: 0; transform: translateY(-15px); }
            }
    
            .form-step-fade-in {
              animation: fadeIn 0.4s ease-out forwards;
            }
    
            .form-step-fade-out {
              animation: fadeOut 0.3s ease-in forwards;
            }
        `;
        document.head.appendChild(style);
    };
    injectAnimationStyles();

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
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.visibility = 'visible';
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
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Contact form submitted');
            contactForm.reset();
            contactSuccess.classList.remove('hidden');
            setTimeout(() => contactSuccess.classList.add('hidden'), 5000);
        });
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

        // --- Notification System ---
        const notificationDiv = document.getElementById('form-notification');
        const notificationMessage = document.getElementById('notification-message');
        let notificationTimeout;

        const showNotification = (message, type = 'error') => {
            if (!notificationDiv || !notificationMessage) return;

            clearTimeout(notificationTimeout);
            notificationMessage.textContent = message;
            notificationDiv.classList.remove('bg-red-600', 'bg-green-600', 'hidden');
            
            notificationDiv.classList.add(type === 'error' ? 'bg-red-600' : 'bg-green-600');

            notificationTimeout = setTimeout(() => {
                notificationDiv.classList.add('hidden');
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

        const formatCPF = (value) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        const formatPhone = (value) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
        const formatCEP = (value) => value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
        const formatCurrency = (value) => {
            if (!value) return '';
            let numStr = value.replace(/\D/g, '');
            if (numStr === '') return '';
            const num = parseFloat(numStr) / 100;
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
        };

        document.getElementById('cpf')?.addEventListener('input', (e) => applyMask(e, formatCPF));
        document.getElementById('condutor-cpf')?.addEventListener('input', (e) => applyMask(e, formatCPF));
        document.getElementById('telefone')?.addEventListener('input', (e) => applyMask(e, formatPhone));
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
            updateProgressBar();
        };

        const requiredFields = {
            1: ['insurance-type'],
            2: ['nome', 'cpf', 'nascimento', 'telefone', 'email', 'genero', 'estado-civil'],
            3: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
            4: {
                auto: ['marca', 'modelo', 'ano', 'chassi', 'tipo-uso', 'cep-pernoite', 'classe-bonus', 'garagem-casa', 'garagem-trabalho'],
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
                const errorDiv = input.closest('div').querySelector('.error-message');
                if (errorDiv) errorDiv.classList.add('hidden');
                input.classList.remove('border-red-500');
                if (!input.value.trim()) {
                    allFieldsValid = false;
                    input.classList.add('border-red-500');
                    if (errorDiv) {
                        errorDiv.textContent = 'Este campo é obrigatório.';
                        errorDiv.classList.remove('hidden');
                    }
                }
            });
            return allFieldsValid;
        };

        const provideInputFeedback = (event) => {
            const input = event.target;
            if (!input.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"], select, textarea')) {
                return;
            }
            const errorDiv = input.closest('div').querySelector('.error-message');
            if (errorDiv && !errorDiv.classList.contains('hidden')) {
                errorDiv.classList.add('hidden');
                input.classList.remove('border-red-500');
            }
            if (input.value.trim() !== '') {
                input.classList.add('border-green-500');
            } else {
                input.classList.remove('border-green-500');
            }
        };

        quoteForm.addEventListener('input', provideInputFeedback);
        quoteForm.addEventListener('change', provideInputFeedback);

        fieldset.disabled = !privacyConsent.checked;
        showStep(currentStep);

        privacyConsent.addEventListener('change', () => {
            fieldset.disabled = !privacyConsent.checked;
        });

        document.querySelectorAll('.insurance-type-radio').forEach(radio => {
            radio.addEventListener('click', () => {
                selectedInsuranceType = radio.value;
                totalSteps = 4;
                document.querySelectorAll('.insurance-type-card').forEach(card => card.classList.remove('border-blue-500', 'bg-blue-50'));
                radio.closest('.insurance-type-option').querySelector('.insurance-type-card').classList.add('border-blue-500', 'bg-blue-50');
                if (selectedInsuranceType === 'auto') loadMarcas();
            });
        });

        const condutorFields = document.getElementById('principal-condutor-fields');
        if (condutorFields) {
            document.querySelectorAll('input[name="proprietario-condutor"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'nao') {
                        condutorFields.classList.remove('hidden');
                    } else {
                        condutorFields.classList.add('hidden');
                    }
                });
            });
        }

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

        recalculateBtn.addEventListener('click', () => {
            quoteResultDiv.classList.add('hidden');
            fieldset.classList.remove('hidden');
            quoteForm.reset();
            quoteForm.querySelectorAll('input, select, textarea').forEach(input => {
                input.classList.remove('border-red-500', 'border-green-500');
                const errorDiv = input.closest('div').querySelector('.error-message');
                if (errorDiv) errorDiv.classList.add('hidden');
            });
            fieldset.disabled = true;
            privacyConsent.checked = false;
            if (condutorFields) {
                condutorFields.classList.add('hidden');
            }
            currentStep = 1;
            totalSteps = 3;
            selectedInsuranceType = '';
            document.querySelectorAll('.insurance-type-card').forEach(card => card.classList.remove('border-blue-500', 'bg-blue-50'));
            showStep(1);
        });

        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
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

});
