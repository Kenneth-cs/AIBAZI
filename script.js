// 配置选项 - 请根据您的coze工作流配置进行修改
const CONFIG = {
    // coze工作流API配置
    COZE_API_URL: 'YOUR_COZE_WORKFLOW_API_ENDPOINT', // 请替换为您的coze工作流API端点
    COZE_API_KEY: 'YOUR_COZE_API_KEY', // 请替换为您的API密钥
    
    // 其他配置
    LOADING_DURATION: 3000, // 最小加载时间(毫秒)
    PROGRESS_ANIMATION_SPEED: 50 // 进度条动画速度
};

// DOM元素引用
const elements = {
    inputSection: document.getElementById('inputSection'),
    loadingSection: document.getElementById('loadingSection'),
    resultSection: document.getElementById('resultSection'),
    birthForm: document.getElementById('birthForm'),
    submitBtn: document.getElementById('submitBtn'),
    newReadingBtn: document.getElementById('newReadingBtn'),
    progressFill: document.getElementById('progressFill'),
    resultContent: document.getElementById('resultContent')
};

// 应用状态
let isProcessing = false;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 绑定事件监听器
    elements.birthForm.addEventListener('submit', handleFormSubmit);
    elements.newReadingBtn.addEventListener('click', handleNewReading);
    
    // 添加表单验证
    addFormValidation();
    
    console.log('八字算命应用已初始化');
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isProcessing) return;
    
    // 获取表单数据
    const formData = getFormData();
    
    // 验证表单数据
    if (!validateFormData(formData)) {
        return;
    }
    
    // 开始处理
    isProcessing = true;
    elements.submitBtn.disabled = true;
    
    try {
        // 显示加载状态
        showLoadingState();
        
        // 调用coze工作流
        const result = await callCozeWorkflow(formData);
        
        // 显示结果
        showResult(result);
        
    } catch (error) {
        console.error('算命过程中发生错误:', error);
        showError(error.message || '算命过程中发生了未知错误，请重试。');
    } finally {
        isProcessing = false;
        elements.submitBtn.disabled = false;
    }
}

// 获取表单数据
function getFormData() {
    const formData = new FormData(elements.birthForm);
    const data = {};
    
    // 获取所有表单字段
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // 构建birth_datetime字符串
    data.birth_datetime = `${data.year}-${String(data.month).padStart(2, '0')}-${String(data.day).padStart(2, '0')} ${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}:${String(data.second).padStart(2, '0')}`;
    
    // 转换数字类型
    data.year = parseInt(data.year);
    data.month = parseInt(data.month);
    data.day = parseInt(data.day);
    data.hour = parseInt(data.hour);
    data.minute = parseInt(data.minute);
    data.second = parseInt(data.second);
    
    return data;
}

// 验证表单数据
function validateFormData(data) {
    const errors = [];
    
    // 验证必填字段
    if (!data.name.trim()) errors.push('请输入姓名');
    if (!data.gender) errors.push('请选择性别');
    if (!data.birth_place.trim()) errors.push('请输入出生地点');
    
    // 验证日期
    if (!data.year || data.year < 1900 || data.year > 2030) {
        errors.push('请输入有效的出生年份(1900-2030)');
    }
    if (!data.month || data.month < 1 || data.month > 12) {
        errors.push('请选择有效的出生月份');
    }
    if (!data.day || data.day < 1 || data.day > 31) {
        errors.push('请输入有效的出生日期');
    }
    
    // 验证时间
    if (data.hour < 0 || data.hour > 23) {
        errors.push('请输入有效的小时(0-23)');
    }
    if (data.minute < 0 || data.minute > 59) {
        errors.push('请输入有效的分钟(0-59)');
    }
    if (data.second < 0 || data.second > 59) {
        errors.push('请输入有效的秒数(0-59)');
    }
    
    // 验证日期是否存在
    const date = new Date(data.year, data.month - 1, data.day);
    if (date.getFullYear() !== data.year || 
        date.getMonth() !== data.month - 1 || 
        date.getDate() !== data.day) {
        errors.push('请输入存在的日期');
    }
    
    if (errors.length > 0) {
        alert('表单验证失败：\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// 添加表单验证
function addFormValidation() {
    // 实时验证日期
    const dayInput = document.getElementById('day');
    const monthSelect = document.getElementById('month');
    const yearInput = document.getElementById('year');
    
    function updateDayOptions() {
        const year = parseInt(yearInput.value);
        const month = parseInt(monthSelect.value);
        
        if (year && month) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const currentDay = parseInt(dayInput.value);
            
            if (currentDay > daysInMonth) {
                dayInput.value = daysInMonth;
            }
            
            dayInput.max = daysInMonth;
        }
    }
    
    monthSelect.addEventListener('change', updateDayOptions);
    yearInput.addEventListener('input', updateDayOptions);
}

// 调用coze工作流
async function callCozeWorkflow(data) {
    // 检查API配置
    if (CONFIG.COZE_API_URL === 'YOUR_COZE_WORKFLOW_API_ENDPOINT') {
        // 如果未配置真实API，返回模拟数据
        return await getMockResult(data);
    }
    
    try {
        const response = await fetch(CONFIG.COZE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.COZE_API_KEY}`,
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('coze工作流调用失败:', error);
        throw error;
    }
}

// 获取模拟结果（用于演示）
async function getMockResult(data) {
    // 模拟API调用延迟
    await sleep(2000);
    
    return {
        success: true,
        data: {
            name: data.name,
            basic_info: {
                birth_date: data.birth_datetime,
                birth_place: data.birth_place,
                gender: data.gender
            },
            bazi_analysis: {
                year_pillar: "庚子",
                month_pillar: "戊寅",
                day_pillar: "甲午",
                hour_pillar: "丙寅",
                five_elements: {
                    wood: 2,
                    fire: 2,
                    earth: 1,
                    metal: 1,
                    water: 2
                }
            },
            fortune_summary: `${data.name}您好，根据您的八字分析：\n\n您出生于${data.birth_datetime}，${data.birth_place}。\n\n八字为：庚子年 戊寅月 甲午日 丙寅时\n\n五行分析：木旺火相，性格开朗积极，具有很强的创造力和领导能力。您天生聪慧，善于思考，在事业上容易取得成功。\n\n财运方面：中年后财运亨通，投资理财方面有很好的天赋，但需要注意不要过于冒险。\n\n感情方面：感情丰富，桃花运较好，但要注意选择合适的伴侣，婚姻生活会很幸福。\n\n健康方面：整体健康状况良好，但需要注意肝胆方面的保养，多运动，保持良好作息。\n\n事业发展：适合从事创意、管理、教育等行业，贵人运较好，容易得到他人帮助。`,
            recommendations: [
                "保持积极乐观的心态，发挥自己的创造天赋",
                "在投资理财时要谨慎，不要盲目跟风",
                "注重身体健康，定期体检，保持良好作息",
                "善待身边的人，广结善缘，贵人运会更旺",
                "选择适合自己的职业道路，发挥专长优势"
            ]
        }
    };
}

// 显示加载状态
function showLoadingState() {
    elements.inputSection.style.display = 'none';
    elements.resultSection.style.display = 'none';
    elements.loadingSection.style.display = 'block';
    
    // 动画效果
    animateProgressBar();
    
    // 滚动到加载区域
    elements.loadingSection.scrollIntoView({ behavior: 'smooth' });
}

// 进度条动画
function animateProgressBar() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) progress = 95;
        
        elements.progressFill.style.width = progress + '%';
        
        if (progress >= 95) {
            clearInterval(interval);
        }
    }, CONFIG.PROGRESS_ANIMATION_SPEED);
}

// 显示结果
function showResult(result) {
    // 完成进度条
    elements.progressFill.style.width = '100%';
    
    setTimeout(() => {
        elements.loadingSection.style.display = 'none';
        elements.resultSection.style.display = 'block';
        
        // 填充结果内容
        displayResultContent(result);
        
        // 滚动到结果区域
        elements.resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// 显示结果内容
function displayResultContent(result) {
    if (!result.success) {
        elements.resultContent.innerHTML = `
            <div class="error-message">
                <h3>😔 算命失败</h3>
                <p>${result.message || '抱歉，无法完成您的八字分析，请稍后重试。'}</p>
            </div>
        `;
        return;
    }
    
    const data = result.data;
    
    elements.resultContent.innerHTML = `
        <div class="result-header">
            <h3>🎋 ${data.name} 的八字命理分析报告</h3>
            <div class="basic-info">
                <p><strong>出生时间：</strong>${data.basic_info.birth_date}</p>
                <p><strong>出生地点：</strong>${data.basic_info.birth_place}</p>
                <p><strong>性别：</strong>${data.basic_info.gender}</p>
            </div>
        </div>
        
        <div class="bazi-info highlight">
            <h4>📜 八字排盘</h4>
            <div class="bazi-pillars">
                <span class="pillar">年柱：${data.bazi_analysis.year_pillar}</span>
                <span class="pillar">月柱：${data.bazi_analysis.month_pillar}</span>
                <span class="pillar">日柱：${data.bazi_analysis.day_pillar}</span>
                <span class="pillar">时柱：${data.bazi_analysis.hour_pillar}</span>
            </div>
        </div>
        
        <div class="five-elements highlight">
            <h4>🌟 五行分析</h4>
            <div class="elements-grid">
                <div class="element">木：${data.bazi_analysis.five_elements.wood}</div>
                <div class="element">火：${data.bazi_analysis.five_elements.fire}</div>
                <div class="element">土：${data.bazi_analysis.five_elements.earth}</div>
                <div class="element">金：${data.bazi_analysis.five_elements.metal}</div>
                <div class="element">水：${data.bazi_analysis.five_elements.water}</div>
            </div>
        </div>
        
        <div class="fortune-summary">
            <h4>🔮 命理综述</h4>
            <div class="summary-text">${data.fortune_summary.replace(/\n/g, '<br>')}</div>
        </div>
        
        <div class="recommendations highlight">
            <h4>💡 人生建议</h4>
            <ul>
                ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="disclaimer">
            <p><small>* 此报告仅供娱乐参考，不构成人生重大决策的依据。命运掌握在自己手中，努力奋斗才是成功的关键。</small></p>
        </div>
    `;
}

// 显示错误信息
function showError(message) {
    elements.loadingSection.style.display = 'none';
    elements.resultSection.style.display = 'block';
    
    elements.resultContent.innerHTML = `
        <div class="error-message">
            <h3>😔 出现错误</h3>
            <p>${message}</p>
            <button onclick="handleNewReading()" class="submit-btn" style="margin-top: 20px;">
                <i class="fas fa-redo"></i>
                重新尝试
            </button>
        </div>
    `;
    
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 处理重新算命
function handleNewReading() {
    elements.resultSection.style.display = 'none';
    elements.loadingSection.style.display = 'none';
    elements.inputSection.style.display = 'block';
    
    // 重置进度条
    elements.progressFill.style.width = '0%';
    
    // 滚动到表单
    elements.inputSection.scrollIntoView({ behavior: 'smooth' });
    
    // 重置状态
    isProcessing = false;
    elements.submitBtn.disabled = false;
}

// 工具函数：睡眠
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 添加一些CSS样式到结果内容
const additionalStyles = `
<style>
.result-header {
    text-align: center;
    margin-bottom: 30px;
}

.basic-info {
    background: rgba(102, 126, 234, 0.1);
    padding: 15px;
    border-radius: 10px;
    margin-top: 15px;
}

.basic-info p {
    margin: 5px 0;
}

.bazi-pillars {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.pillar {
    background: #667eea;
    color: white;
    padding: 10px;
    text-align: center;
    border-radius: 8px;
    font-weight: 600;
}

.elements-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 10px;
}

.element {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #333;
    padding: 10px;
    text-align: center;
    border-radius: 8px;
    font-weight: 600;
}

.summary-text {
    background: white;
    padding: 20px;
    border-radius: 10px;
    line-height: 1.8;
    margin-top: 10px;
}

.recommendations ul {
    list-style: none;
    padding: 0;
}

.recommendations li {
    background: white;
    padding: 12px 15px;
    margin: 8px 0;
    border-radius: 8px;
    border-left: 4px solid #28a745;
    position: relative;
}

.recommendations li:before {
    content: "✨";
    margin-right: 8px;
}

.disclaimer {
    text-align: center;
    margin-top: 30px;
    padding: 15px;
    background: rgba(255, 193, 7, 0.1);
    border-radius: 10px;
    border: 1px solid #ffc107;
}

.error-message {
    text-align: center;
    padding: 40px;
    color: #dc3545;
}

.error-message h3 {
    color: #dc3545;
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .bazi-pillars {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .elements-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 480px) {
    .elements-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
`;

// 将额外样式添加到页面
document.head.insertAdjacentHTML('beforeend', additionalStyles); 