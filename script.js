document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Mobile Menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Smooth Scrolling for anchor links ---
    // This is a robust implementation that avoids conflicts with other scripts.
    // By scoping to 'nav', we ensure this only applies to the main navigation links.
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // 1. Ignore links that are just "#". These are almost always for JS triggers.
            if (targetId === '#') {
                return;
            }

            // 2. Try to find the element this link points to.
            try {
                const targetElement = document.querySelector(targetId);

                // 3. Only act if the element actually exists on the page.
                if (targetElement) {
                    // 4. This is a valid internal link, so we handle the scroll.
                    e.preventDefault();

                    const navbar = document.querySelector('nav');
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
                // 5. If targetElement is null, we do nothing and let the browser/other scripts proceed.
            } catch (error) {
                // Catch potential errors from an invalid selector in targetId.
                console.warn('Could not query selector for smooth scroll:', targetId, error);
            }
        });
    });

    // --- Animate on Scroll ---
    // The original animation logic was causing some content sections to remain hidden.
    // To guarantee that all content is always visible, we will now directly
    // set the styles to make the elements appear. This is the most reliable method
    // and bypasses any potential issues with CSS classes.
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.visibility = 'visible';
    });

    // --- Insurance Carousel (Infinite Scroll) ---
    // O código abaixo duplica os itens do carrossel para criar um efeito de rolagem infinita.
    // Se a animação CSS correspondente não estiver presente, ele parecerá apenas duplicado.
    // Foi comentado para remover a duplicação. Se desejar o efeito, reative e ajuste seu CSS.
    // const carousel = document.getElementById('insurance-carousel');
    // if (carousel) {
    //     const clone = carousel.cloneNode(true);
    //     carousel.parentElement.appendChild(clone);
    // }

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
            // Here you would typically send the form data to a backend
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

        let currentStep = 1;
        let totalSteps = 3;
        let selectedInsuranceType = '';

        const VIA_CEP_URL = (cep) => `https://viacep.com.br/ws/${cep}/json/`;
        const FIPE_MARCAS_URL = 'https://parallelum.com.br/fipe/api/v1/carros/marcas';
        const FIPE_MODELOS_URL = (marcaId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos`;
        const FIPE_ANOS_URL = (marcaId, modeloId) => `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaId}/modelos/${modeloId}/anos`;

        const updateProgressBar = () => {
            const progress = (currentStep / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        };

        const showStep = (stepNumber) => {
            steps.forEach(step => {
                const stepData = parseInt(step.dataset.step);
                const isTypeSpecificStep = step.dataset.insuranceType;
                let isVisible = stepData === stepNumber;

                if (isVisible && isTypeSpecificStep && isTypeSpecificStep !== selectedInsuranceType) {
                    isVisible = false;
                }
                step.classList.toggle('hidden', !isVisible);
                if(isVisible && isTypeSpecificStep) {
                    document.getElementById(`${selectedInsuranceType}-section`).classList.remove('hidden');
                }
            });

            prevBtn.classList.toggle('hidden', currentStep === 1);
            nextBtn.classList.toggle('hidden', currentStep === totalSteps);
            submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
            updateProgressBar();
        };

        // Configuração centralizada dos campos obrigatórios por etapa.
        const requiredFieldsConfig = {
            2: ['nome', 'email', 'telefone', 'cpf', 'nascimento', 'genero', 'estado-civil'],
            3: {
                auto: ['marca', 'modelo', 'ano', 'chassi', 'placa', 'tipo-uso', 'cep-pernoite'],
                residencial: ['tipo-imovel', 'finalidade-imovel', 'tipo-construcao', 'valor-imovel', 'valor-conteudo'],
                vida: ['capital-segurado', 'profissao', 'renda-mensal']
            },
            4: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado']
        };

        const validateStep = (stepNumber) => {
            let requiredIds = [];
            // Define a lista de IDs obrigatórios com base na etapa e tipo de seguro
            if (stepNumber === 2 || stepNumber === 4) {
                requiredIds = requiredFieldsConfig[stepNumber];
            } else if (stepNumber === 3 && selectedInsuranceType && requiredFieldsConfig[3][selectedInsuranceType]) {
                requiredIds = requiredFieldsConfig[3][selectedInsuranceType];
            }

            // Adiciona os campos condicionais do condutor, se necessário
            if (stepNumber === 3 && selectedInsuranceType === 'auto') {
                const ownerIsNotDriver = document.querySelector('input[name="proprietario-condutor"][value="nao"]:checked');
                if (ownerIsNotDriver) {
                    requiredIds.push('condutor-nome', 'condutor-cpf');
                }
            }

            if (requiredIds.length === 0) return true; // Nenhuma validação necessária

            let allFieldsValid = true;
            requiredIds.forEach(id => {
                const input = document.getElementById(id);
                // A verificação de visibilidade é crucial.
                // Ignora campos que não existem ou não estão visíveis na tela.
                if (!input || input.offsetParent === null) {
                    return;
                }

                // Limpa erros anteriores
                const errorDiv = input.closest('div').querySelector('.error-message');
                if (errorDiv) {
                    errorDiv.classList.add('hidden');
                }
                input.classList.remove('border-red-500', 'border-green-500');

                if (!input.value.trim()) { // Se o campo obrigatório estiver vazio
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

        // --- Real-time visual feedback on input ---
        const provideInputFeedback = (event) => {
            const input = event.target;

            // Aplica feedback apenas em campos de texto, seleção e área de texto
            if (!input.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"], select, textarea')) {
                return;
            }

            // Limpa o erro se o usuário começar a corrigir um campo inválido
            const errorDiv = input.closest('div').querySelector('.error-message');
            if (errorDiv && !errorDiv.classList.contains('hidden')) {
                errorDiv.classList.add('hidden');
                input.classList.remove('border-red-500');
            }

            // Adiciona ou remove a borda verde com base no preenchimento
            if (input.value.trim() !== '') {
                input.classList.add('border-green-500');
            } else {
                input.classList.remove('border-green-500');
            }
        };

        // Usa delegação de eventos para eficiência. 'input' cobre digitação, 'change' cobre seleções.
        quoteForm.addEventListener('input', provideInputFeedback);
        quoteForm.addEventListener('change', provideInputFeedback);

        // --- FORM INITIALIZATION ---
        fieldset.disabled = !privacyConsent.checked;
        showStep(currentStep); // Show the first step on page load. It will be disabled if consent is not given.

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

        // --- Logic for conditional driver fields ---
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
                alert('Por favor, selecione um tipo de seguro.');
                return;
            }
            if (!validateStep(currentStep)) {
                alert('Por favor, preencha todos os campos obrigatórios destacados.');
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

            // Limpa todos os feedbacks visuais de validação (bordas vermelhas/verdes)
            quoteForm.querySelectorAll('input, select, textarea').forEach(input => {
                input.classList.remove('border-red-500', 'border-green-500');
                const errorDiv = input.closest('div').querySelector('.error-message');
                if (errorDiv) errorDiv.classList.add('hidden');
            });

            // Reseta o estado do formulário para o início
            fieldset.disabled = true;
            privacyConsent.checked = false;

            // Esconde campos condicionais no reset
            if (condutorFields) {
                condutorFields.classList.add('hidden');
            }

            currentStep = 1;
            totalSteps = 3;
            selectedInsuranceType = '';
            document.querySelectorAll('.insurance-type-card').forEach(card => card.classList.remove('border-blue-500', 'bg-blue-50'));
            // Reseta o formulário para a primeira etapa, que ficará visível mas desabilitada
            // até que o usuário aceite a política de privacidade novamente.
            showStep(1);
        });

        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Valida a última etapa antes de enviar
            if (!validateStep(currentStep)) {
                alert('Por favor, preencha todos os campos obrigatórios destacados antes de enviar.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

            // --- Robust Data Collection ---
            // Manually collect data to ensure all fields are captured, even if 'name' attributes are missing in the HTML.
            const data = { insuranceType: selectedInsuranceType };
            const formElements = quoteForm.querySelectorAll('input, select, textarea');

            formElements.forEach(el => {
                // Use the element's name or fallback to its ID as the key.
                const key = el.name || el.id;
                if (!key) return; // Skip elements without a name or id.

                if (el.type === 'radio') {
                    if (el.checked) {
                        data[key] = el.value;
                    }
                } else {
                    // For all other types (text, select, etc.), assign the value.
                    // Checkboxes are handled separately in the email formatting section.
                    data[key] = el.value;
                }
            });
            
            // --- Formatação do E-mail ---
            // Para um e-mail mais organizado, criamos um corpo de texto formatado
            // e usamos os campos especiais do Formspree (_subject, _replyto).

            const insuranceTypeName = {
                auto: 'Automóvel',
                vida: 'de Vida',
                residencial: 'Residencial'
            }[selectedInsuranceType] || selectedInsuranceType;

            const personalDataSection = `
**DADOS DO CLIENTE**
- **Nome:** ${data.nome || 'Não informado'}
- **Email:** ${data.email || 'Não informado'}
- **Telefone:** ${data.telefone || 'Não informado'}
- **CPF:** ${data.cpf || 'Não informado'}
- **Data de Nascimento:** ${data.nascimento ? new Date(data.nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}
- **Gênero:** ${data.genero || 'Não informado'}
- **Estado Civil:** ${data['estado-civil'] || 'Não informado'}
`;

            const addressSection = `
**ENDEREÇO**
- **CEP:** ${data.cep || 'Não informado'}
- **Logradouro:** ${data.rua || 'Não informado'}, Nº ${data.numero || 'S/N'}
- **Bairro:** ${data.bairro || 'Não informado'}
- **Cidade/UF:** ${data.cidade || 'Não informado'}/${data.estado || 'Não informado'}
`;

            let detailsSection = '';
            if (selectedInsuranceType === 'auto') {
                const marcaText = data.marca ? marcaSelect.options[marcaSelect.selectedIndex].text : 'Não informado';
                const modeloText = data.modelo ? modeloSelect.options[modeloSelect.selectedIndex].text : 'Não informado';
                const anoText = data.ano ? anoSelect.options[anoSelect.selectedIndex].text : 'Não informado';

                let condutorSection = `
- **Proprietário é o Principal Condutor?** ${data['proprietario-condutor'] === 'sim' ? 'Sim' : 'Não'}`;

                if (data['proprietario-condutor'] === 'nao') {
                    condutorSection += `
- **Nome do Principal Condutor:** ${data['condutor-nome'] || 'Não informado'}
- **CPF do Principal Condutor:** ${data['condutor-cpf'] || 'Não informado'}`;
                }

                detailsSection = `
**DADOS DO VEÍCULO**
- **Marca:** ${marcaText}
- **Modelo:** ${modeloText}
- **Ano/Modelo:** ${anoText}
- **Chassi:** ${data.chassi || 'Não informado'}
- **Placa:** ${data.placa || 'Não informado'}
- **Tipo de Uso:** ${data['tipo-uso'] || 'Não informado'}
- **CEP de Pernoite:** ${data['cep-pernoite'] || 'Não informado'}
- **Classe de Bônus:** ${data['classe-bonus'] || 'Não informado'}
- **Garagem em Casa?** ${data['garagem-casa'] || 'Não informado'}
- **Garagem no Trabalho/Estudo?** ${data['garagem-trabalho'] || 'Não informado'}
${condutorSection}
`;
            } else if (selectedInsuranceType === 'residencial') {
                const coberturas = Array.from(document.querySelectorAll('input[name="coberturas"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()).join(', ') || 'Nenhuma';
                const seguranca = Array.from(document.querySelectorAll('input[name="seguranca"]:checked')).map(cb => cb.nextElementSibling.textContent.trim()).join(', ') || 'Nenhuma';
                detailsSection = `
**DADOS DO IMÓVEL**
- **Tipo de Imóvel:** ${data['tipo-imovel'] || 'Não informado'}
- **Uso do Imóvel:** ${data['finalidade-imovel'] || 'Não informado'}
- **Tipo de Construção:** ${data['tipo-construcao'] || 'Não informado'}
- **Área Construída (m²):** ${data['area-construida'] || 'Não informado'}
- **Valor de Reconstrução (R$):** ${data['valor-imovel'] || 'Não informado'}
- **Valor dos Bens/Conteúdo (R$):** ${data['valor-conteudo'] || 'Não informado'}
- **Coberturas Adicionais:** ${coberturas}
- **Sistemas de Segurança:** ${seguranca}
`;
            } else if (selectedInsuranceType === 'vida') {
                detailsSection = `
**DADOS DO SEGURO DE VIDA**
- **Capital Segurado Desejado (R$):** ${data['capital-segurado'] || 'Não informado'}
- **Profissão:** ${data.profissao || 'Não informado'}
- **Renda Mensal (R$):** ${data['renda-mensal'] || 'Não informado'}
- **Pratica Esportes Radicais?** ${data['esportes-radicais'] || 'Não informado'}
- **Fumante?** ${data.fumante || 'Não informado'}
- **Histórico de Doenças Graves?** ${data['doencas-graves'] || 'Não informado'}
`;
            }

            const emailBody = `
Nova Solicitação de Cotação de Seguro ${insuranceTypeName}
----------------------------------------------------
${personalDataSection}
${addressSection}
${detailsSection}
----------------------------------------------------
Este e-mail foi enviado automaticamente pelo formulário de cotação do site.
`;

            const payload = {
                _subject: `Cotação de Seguro ${insuranceTypeName} - ${data.nome}`,
                _replyto: data.email,
                "Solicitação de Cotação": emailBody,
            };

            try {
                const response = await sendDataToBroker(payload);
                if (!response.ok) throw new Error('Falha ao enviar a solicitação.');

                fieldset.classList.add('hidden');
                quoteResultDiv.classList.remove('hidden');

                const phone = '5518981558125'; // <-- COLOQUE SEU NÚMERO AQUI
                const clientName = document.getElementById('nome').value.split(' ')[0] || 'Cliente';
                const message = `Olá! Acabei de fazer uma cotação pelo site em nome de ${clientName} e gostaria de saber o preço.`;
                whatsappRedirectBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            } catch (error) {
                console.error('Submission Error:', error);
                alert('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar Solicitação';
            }
        });

        async function sendDataToBroker(data) {
            // IMPORTANTE: Substitua pela URL do seu endpoint de backend.
            // Serviços como Formspree, Netlify Forms ou um endpoint próprio são ideais.
            // Certifique-se de que o ID do seu formulário Formspree esteja correto aqui.
            const endpoint = 'https://formspree.io/f/myzdyybp';
            
            console.log('Enviando dados para a corretora:', data);

            // Este é o código que envia os dados para o seu e-mail via Formspree.
            return fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Adicionado para melhor compatibilidade com Formspree
                },
                body: JSON.stringify(data),
            });
        }

        // --- API Fetching Helper ---
        async function fetchAPIData(url, errorMessage) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error(errorMessage, error);
                return null; // Retorna nulo para que a função que chamou possa lidar com o erro.
            }
        }

        const cepInput = document.getElementById('cep');
        cepInput?.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                const data = await fetchAPIData(VIA_CEP_URL(cep), 'Erro ao buscar CEP:');
                if (data && !data.erro) {
                    document.getElementById('rua').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('estado').value = data.uf;
                }
            }
        });

        const marcaSelect = document.getElementById('marca');
        const modeloSelect = document.getElementById('modelo');
        const anoSelect = document.getElementById('ano');

        async function loadMarcas() {
            if (!marcaSelect || marcaSelect.options.length > 1) return;
            const marcas = await fetchAPIData(FIPE_MARCAS_URL, 'Erro ao carregar marcas:');
            if (!marcas) {
                marcaSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                return;
            }
            marcaSelect.innerHTML = '<option value="">Selecione a Marca</option>';
            marcas.forEach(marca => marcaSelect.add(new Option(marca.nome, marca.codigo)));
        }

        marcaSelect?.addEventListener('change', async () => {
            const marcaId = marcaSelect.value;
            modeloSelect.disabled = true; anoSelect.disabled = true;
            modeloSelect.innerHTML = '<option value="">Selecione a marca</option>'; anoSelect.innerHTML = '<option value="">Selecione o modelo</option>';
            if (!marcaId) return;
            
            modeloSelect.innerHTML = '<option value="">Carregando...</option>';
            const data = await fetchAPIData(FIPE_MODELOS_URL(marcaId), 'Erro ao carregar modelos:');
            if (!data || !data.modelos) {
                modeloSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                return;
            }
            modeloSelect.innerHTML = '<option value="">Selecione o Modelo</option>';
            data.modelos.forEach(modelo => modeloSelect.add(new Option(modelo.nome, modelo.codigo)));
            modeloSelect.disabled = false;
        });

        modeloSelect?.addEventListener('change', async () => {
            const marcaId = marcaSelect.value;
            const modeloId = modeloSelect.value;
            anoSelect.disabled = true; anoSelect.innerHTML = '<option value="">Selecione o modelo</option>';
            if (!marcaId || !modeloId) return;

            anoSelect.innerHTML = '<option value="">Carregando...</option>';
            const anos = await fetchAPIData(FIPE_ANOS_URL(marcaId, modeloId), 'Erro ao carregar anos:');
            if (!anos) {
                anoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                return;
            }
            anoSelect.innerHTML = '<option value="">Selecione o Ano</option>';
            anos.forEach(ano => anoSelect.add(new Option(ano.nome, ano.codigo)));
            anoSelect.disabled = false;
        });
    }
});
