
        // Tab切换功能
        function switchTab(index) {
            const tabs = document.querySelectorAll('.tab-btn');
            const contents = document.querySelectorAll('.tab-content');

            tabs.forEach((tab, i) => {
                if (i === index) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            contents.forEach((content, i) => {
                if (i === index) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }

        // 逻辑门信息显示
        const gateInfo = {
            'AND': {
                name: 'AND门（与门）',
                description: '只有当所有输入都为1时，输出才为1',
                formula: 'Y = A · B',
                truth: [
                    ['0', '0', '0'],
                    ['0', '1', '0'],
                    ['1', '0', '0'],
                    ['1', '1', '1']
                ],
                application: 'CPU中的条件判断、权限控制'
            },
            'OR': {
                name: 'OR门（或门）',
                description: '只要有任一输入为1，输出就为1',
                formula: 'Y = A + B',
                truth: [
                    ['0', '0', '0'],
                    ['0', '1', '1'],
                    ['1', '0', '1'],
                    ['1', '1', '1']
                ],
                application: '中断处理、事件触发'
            },
            'NOT': {
                name: 'NOT门（非门）',
                description: '输出是输入的反相',
                formula: 'Y = ¬A',
                truth: [
                    ['0', '1'],
                    ['1', '0']
                ],
                application: '信号反相、逻辑取反'
            },
            'NAND': {
                name: 'NAND门（与非门）',
                description: 'AND门后接NOT门，具有通用性',
                formula: 'Y = ¬(A · B)',
                truth: [
                    ['0', '0', '1'],
                    ['0', '1', '1'],
                    ['1', '0', '1'],
                    ['1', '1', '0']
                ],
                application: '存储器设计、通用逻辑实现'
            },
            'NOR': {
                name: 'NOR门（或非门）',
                description: 'OR门后接NOT门，也具有通用性',
                formula: 'Y = ¬(A + B)',
                truth: [
                    ['0', '0', '1'],
                    ['0', '1', '0'],
                    ['1', '0', '0'],
                    ['1', '1', '0']
                ],
                application: '锁存器设计、控制电路'
            },
            'XOR': {
                name: 'XOR门（异或门）',
                description: '输入不同时输出为1',
                formula: 'Y = A ⊕ B',
                truth: [
                    ['0', '0', '0'],
                    ['0', '1', '1'],
                    ['1', '0', '1'],
                    ['1', '1', '0']
                ],
                application: '加法器、奇偶校验、加密'
            }
        };

        function showGateInfo(gate) {
            const info = gateInfo[gate];
            const display = document.getElementById('gateInfoDisplay');

            let truthTableHTML = '<table class="truth-table"><tr>';
            if (gate === 'NOT') {
                truthTableHTML += '<th>A</th><th>Y</th></tr>';
            } else {
                truthTableHTML += '<th>A</th><th>B</th><th>Y</th></tr>';
            }

            info.truth.forEach(row => {
                truthTableHTML += '<tr>';
                row.forEach(cell => {
                    truthTableHTML += `<td>${cell}</td>`;
                });
                truthTableHTML += '</tr>';
            });
            truthTableHTML += '</table>';

            display.innerHTML = `
                <h3 style="color: var(--accent-red);">${info.name}</h3>
                <p style="line-height: 1.8; margin: 15px 0;">${info.description}</p>
                <div class="law-formula" style="margin: 15px 0;">${info.formula}</div>
                <h4 style="margin-top: 20px; color: var(--accent-red);">真值表：</h4>
                ${truthTableHTML}
                <div style="margin-top: 20px; padding: 15px; background: rgba(220,20,60,0.1); border-radius: 8px; border-left: 4px solid var(--accent-red);">
                    <strong style="color: var(--accent-red);">典型应用：</strong> ${info.application}
                </div>
            `;
        }

        // 逻辑门模拟器
        let inputA = 0;
        let inputB = 0;

        function toggleSwitch(input) {
            if (input === 'A') {
                inputA = 1 - inputA;
                const switchA = document.getElementById('switchA');
                const valueA = document.getElementById('valueA');
                if (inputA === 1) {
                    switchA.classList.add('on');
                } else {
                    switchA.classList.remove('on');
                }
                valueA.textContent = inputA;
            } else {
                inputB = 1 - inputB;
                const switchB = document.getElementById('switchB');
                const valueB = document.getElementById('valueB');
                if (inputB === 1) {
                    switchB.classList.add('on');
                } else {
                    switchB.classList.remove('on');
                }
                valueB.textContent = inputB;
            }
            updateSimulation();
        }

        function updateSimulation() {
            const gate = document.getElementById('gateSelector').value;
            const inputBContainer = document.getElementById('inputBContainer');

            // NOT门只需要一个输入
            if (gate === 'NOT') {
                inputBContainer.style.display = 'none';
            } else {
                inputBContainer.style.display = 'flex';
            }

            let output = 0;
            switch (gate) {
                case 'AND':
                    output = inputA & inputB;
                    break;
                case 'OR':
                    output = inputA | inputB;
                    break;
                case 'NOT':
                    output = 1 - inputA;
                    break;
                case 'NAND':
                    output = 1 - (inputA & inputB);
                    break;
                case 'NOR':
                    output = 1 - (inputA | inputB);
                    break;
                case 'XOR':
                    output = inputA ^ inputB;
                    break;
            }

            const outputValue = document.getElementById('outputValue');
            const outputLED = document.getElementById('outputLED');

            outputValue.textContent = output;
            if (output === 1) {
                outputLED.classList.add('on');
            } else {
                outputLED.classList.remove('on');
            }
        }

        // 定律验证
        function verifyLaw() {
            const law = document.getElementById('lawSelector').value;
            const display = document.getElementById('lawVerification');

            let html = '';

            if (law === 'demorgan1') {
                html = `
                    <h4 style="color: var(--accent-red); margin-bottom: 15px;">验证：¬(A + B) = ¬A · ¬B</h4>
                    <table class="truth-table">
                        <tr>
                            <th>A</th>
                            <th>B</th>
                            <th>A + B</th>
                            <th>¬(A + B)</th>
                            <th>¬A</th>
                            <th>¬B</th>
                            <th>¬A · ¬B</th>
                            <th>验证</th>
                        </tr>
                        <tr>
                            <td>0</td><td>0</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td>1</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td>0</td><td>1</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td>1</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td>1</td><td>0</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td>0</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td>1</td><td>1</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td>0</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                    </table>
                    <p style="margin-top: 15px; color: #00ff00; font-weight: bold;">✓ 定律验证成功！所有情况下等式两边结果相同。</p>
                `;
            } else if (law === 'demorgan2') {
                html = `
                    <h4 style="color: var(--accent-red); margin-bottom: 15px;">验证：¬(A · B) = ¬A + ¬B</h4>
                    <table class="truth-table">
                        <tr>
                            <th>A</th>
                            <th>B</th>
                            <th>A · B</th>
                            <th>¬(A · B)</th>
                            <th>¬A</th>
                            <th>¬B</th>
                            <th>¬A + ¬B</th>
                            <th>验证</th>
                        </tr>
                        <tr>
                            <td>0</td><td>0</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td>1</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td>0</td><td>1</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td>1</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td>1</td><td>0</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td>0</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td>1</td><td>1</td><td>1</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td>0</td><td>0</td><td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                    </table>
                    <p style="margin-top: 15px; color: #00ff00; font-weight: bold;">✓ 定律验证成功！所有情况下等式两边结果相同。</p>
                `;
            } else if (law === 'absorption1') {
                html = `
                    <h4 style="color: var(--accent-red); margin-bottom: 15px;">验证：A + (A · B) = A</h4>
                    <table class="truth-table">
                        <tr>
                            <th>A</th>
                            <th>B</th>
                            <th>A · B</th>
                            <th>A + (A · B)</th>
                            <th>验证</th>
                        </tr>
                        <tr>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td>0</td><td>0</td>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td>1</td><td>0</td>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">0</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td>0</td><td>0</td>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                        <tr>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td>1</td><td>1</td>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">1</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>
                    </table>
                    <p style="margin-top: 15px; color: #00ff00; font-weight: bold;">✓ 定律验证成功！A + (A · B) 的结果始终等于 A。</p>
                `;
            } else if (law === 'distributive') {
                html = `
                    <h4 style="color: var(--accent-red); margin-bottom: 15px;">验证：A · (B + C) = (A · B) + (A · C)</h4>
                    <table class="truth-table">
                        <tr>
                            <th>A</th>
                            <th>B</th>
                            <th>C</th>
                            <th>B + C</th>
                            <th>A · (B + C)</th>
                            <th>A · B</th>
                            <th>A · C</th>
                            <th>(A · B) + (A · C)</th>
                            <th>验证</th>
                        </tr>
                        ${generateDistributiveRows()}
                    </table>
                    <p style="margin-top: 15px; color: #00ff00; font-weight: bold;">✓ 定律验证成功！所有情况下等式两边结果相同。</p>
                `;
            }

            display.innerHTML = html;
        }

        function generateDistributiveRows() {
            let rows = '';
            for (let a = 0; a <= 1; a++) {
                for (let b = 0; b <= 1; b++) {
                    for (let c = 0; c <= 1; c++) {
                        const bOrC = b | c;
                        const left = a & bOrC;
                        const aAndB = a & b;
                        const aAndC = a & c;
                        const right = aAndB | aAndC;
                        const match = left === right;

                        rows += `<tr>
                            <td>${a}</td><td>${b}</td><td>${c}</td><td>${bOrC}</td>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">${left}</td>
                            <td>${aAndB}</td><td>${aAndC}</td>
                            <td style="background: rgba(220,20,60,0.2); font-weight: bold;">${right}</td>
                            <td style="color: #00ff00;">✓</td>
                        </tr>`;
                    }
                }
            }
            return rows;
        }

        // 初始化
        updateSimulation();
        verifyLaw();
    