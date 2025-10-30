*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Keywords ***
Login And Select Table
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    ร้านนายสมชาย    10s
    Wait Until Page Contains Element    xpath=//button[not(@disabled) and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]]    20s
    ${free_tables}=    Get WebElements    xpath=//button[not(@disabled) and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]]
    ${count}=    Get Length    ${free_tables}
    Log    พบโต๊ะว่าง ${count} โต๊ะ
    Run Keyword If    ${count} > 0    Click Element    ${free_tables}[0]
    ${table_number}=    Get Text    xpath=(//button[not(@disabled) and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]])[1]//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]
    Wait Until Keyword Succeeds    10s    1s    Element Attribute Value Should Be    xpath=//button[@aria-pressed="true" and .//span[text()='${table_number}']]    aria-pressed    true
    Sleep    1s
    Run Keyword If    ${count} > 0    Click Button    xpath=//button[contains(text(),'ยืนยันการจอง')]
    Wait Until Page Contains    สั่งอาหารสำหรับโต๊ะ    10s

*** Test Cases ***
1. เลือกทุกหมวดหมู่แล้วแสดงทีละหมวดหมู่
    Login And Select Table
    ${categories}=    Create List    ทั้งหมด    อาหารจานเดียว    เส้น    ซุป    เครื่องดื่ม    ของหวาน
    FOR    ${cat}    IN    @{categories}
        Click Button    xpath=//button[contains(text(),'${cat}')]
        Sleep    1s
        Capture Page Screenshot    ${CURDIR}${/}results${/}Order-Category-${cat}.png
    END
    Close Browser

2. กดเพิ่มอาหาร 1 รายการลงตะกร้า
    Login And Select Table
    # คลิกการ์ดเมนู "ข้าวผัดหมู"
    Click Element    xpath=//h3[text()='ข้าวผัดหมู']/ancestor::div[contains(@class,'bg-[#FFA559]')]
    Sleep    1s
    # ไปหน้าตะกร้า
    Click Button    xpath=//button[.//span[text()='Cart']]
    Sleep    2s
    Wait Until Page Contains    ตะกร้าสินค้า    10s
    # ตรวจสอบว่ามี "ข้าวผัดหมู" ในตะกร้า
    Element Should Be Visible    xpath=//h4[contains(text(),'ข้าวผัดหมู')]
    # ตรวจสอบจำนวนเป็น 1
    Element Attribute Value Should Be    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//input[@type='number']    value    1
    Capture Page Screenshot    ${CURDIR}${/}results${/}Order-Add-1-Item-In-Cart.png
    Close Browser

3. กดเพิ่มอาหารซ้ำ (อาหารเดิม)
    Login And Select Table
    Click Element    xpath=//h3[text()='ข้าวผัดหมู']/ancestor::div[contains(@class,'bg-[#FFA559]')]
    Sleep    1s
    Click Element    xpath=//h3[text()='ข้าวผัดหมู']/ancestor::div[contains(@class,'bg-[#FFA559]')]
    Sleep    1s
    # ไปหน้าตะกร้า
    Click Button    xpath=//button[.//span[text()='Cart']]
    Sleep    2s
    Wait Until Page Contains    ตะกร้าสินค้า    10s
    # ตรวจสอบว่ามี "ข้าวผัดหมู" ในตะกร้า
    Element Should Be Visible    xpath=//h4[contains(text(),'ข้าวผัดหมู')]
    # ตรวจสอบจำนวนเป็น 2
    Element Attribute Value Should Be    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//input[@type='number']    value    2
    Capture Page Screenshot    ${CURDIR}${/}results${/}Order-Add-Same-Item-Twice-In-Cart.png
    Close Browser
    
4. กดปุ่ม Cart แล้วไปหน้าตะกร้า
    Login And Select Table
    Click Button    xpath=//button[.//span[text()='Cart']]
    Sleep    2s
    Wait Until Page Contains    ตะกร้าสินค้า    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Order-Go-To-Cart.png
    Close Browser

5. กดปุ่มย้อนกลับแล้วกลับไปหน้าเลือกโต๊ะ
    Login And Select Table
    Sleep    2s
    Click Button    xpath=//button[contains(text(),'← กลับ')]
    Sleep    2s
    Wait Until Page Contains    ร้านนายสมชาย    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Order-Back-To-Table.png
    Close Browser
