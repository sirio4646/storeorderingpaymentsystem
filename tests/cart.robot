*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Keywords ***
Login Select Table And Add Food
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
    # เพิ่มอาหาร "ข้าวผัดหมู" 1 รายการ
    Click Element    xpath=//h3[text()='ข้าวผัดหมู']/ancestor::div[contains(@class,'bg-[#FFA559]')]
    Sleep    1s
    # ไปหน้าตะกร้า
    Click Button    xpath=//button[.//span[text()='Cart']]
    Wait Until Page Contains    ตะกร้าสินค้า    10s

*** Test Cases ***
1. เพิ่มจำนวนอาหารในตะกร้า
    Login Select Table And Add Food
    # กดปุ่ม + ที่รายการอาหาร
    Click Button    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//button[normalize-space(text())='+']
    Sleep    1s
    # ตรวจสอบจำนวนเพิ่มขึ้น (เป็น 2)
    Element Attribute Value Should Be    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//input[@type='number']    value    2
    # ตรวจสอบยอดรวมเปลี่ยน (ตัวอย่าง: มี <span> ยอดรวม)
    # Element Should Contain    xpath=//span[@id='total-amount']    100
    Capture Page Screenshot    ${CURDIR}${/}results${/}Cart-Increase-Qty.png
    Close Browser

2. ลดจำนวนอาหารในตะกร้า
    Login Select Table And Add Food
    # เพิ่มจำนวนก่อน 1 ครั้ง
    Click Button    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//button[normalize-space(text())='+']
    Sleep    1s
    # กดปุ่ม - ที่รายการอาหาร
    Click Button    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//button[normalize-space(text())='-']
    Sleep    1s
    # ตรวจสอบจำนวนลดลง (เป็น 1)
    Element Attribute Value Should Be    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//input[@type='number']    value    1
    Capture Page Screenshot    ${CURDIR}${/}results${/}Cart-Decrease-Qty.png
    Close Browser

3. แก้ไขหมายเหตุในตะกร้า
    Login Select Table And Add Food
    # พิมพ์หมายเหตุ
    Input Text    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//input[@placeholder='หมายเหตุ เช่น ไม่เผ็ด']    ไม่ใส่ผัก
    Sleep    1s
    # ตรวจสอบว่าหมายเหตุเปลี่ยน
    Element Attribute Value Should Be    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//input[@placeholder='หมายเหตุ เช่น ไม่เผ็ด']    value    ไม่ใส่ผัก
    Capture Page Screenshot    ${CURDIR}${/}results${/}Cart-Note.png
    Close Browser

4. ลบอาหารออกจากตะกร้า
    Login Select Table And Add Food
    # กดปุ่ม "ลบ"
    Click Button    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//button[contains(text(),'ลบ')]
    Sleep    1s
    # ตรวจสอบว่าไม่มี "ข้าวผัดหมู" ในตะกร้า
    Element Should Not Be Visible    xpath=//h4[contains(text(),'ข้าวผัดหมู')]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Cart-Remove-Item.png
    Close Browser

5. กดปุ่ม "ชำระเงิน" ขณะตะกร้าว่าง
    Login Select Table And Add Food
    # ลบอาหารจนตะกร้าว่าง
    Click Button    xpath=//h4[contains(text(),'ข้าวผัดหมู')]/ancestor::li//button[contains(text(),'ลบ')]
    Sleep    1s
    # กดปุ่ม "ชำระเงิน"
    Click Button    xpath=//button[contains(text(),'ชำระเงิน')]
    ${alert_text}=    Handle Alert    action=ACCEPT
    Should Be Equal    ${alert_text}    ตะกร้าว่าง! กรุณาเลือกอาหารก่อนชำระเงิน
    Capture Page Screenshot    ${CURDIR}${/}results${/}Cart-Empty-Alert.png
    Close Browser

6. กดปุ่ม "ชำระเงิน" ขณะมีอาหารในตะกร้า
    Login Select Table And Add Food
    # กดปุ่ม "ชำระเงิน"
    Click Button    xpath=//button[contains(text(),'ชำระเงิน')]
    ${alert_text}=    Handle Alert    action=ACCEPT
    Should Be Equal    ${alert_text}    ออเดอร์ถูกสร้างแล้ว
    Wait Until Page Contains    ชำระเงิน    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Cart-Checkout-Success.png
    Close Browser
