*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Keywords ***
Login To Cart
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
    # กดปุ่ม "ชำระเงิน"
    Click Button    xpath=//button[contains(text(),'ชำระเงิน')]
    ${alert_text}=    Handle Alert    action=ACCEPT
    Should Be Equal    ${alert_text}    ออเดอร์ถูกสร้างแล้ว

*** Test Cases ***
1. ไม่เลือกวิธีชำระเงิน ปุ่ม "ชำระเงิน" ต้อง disabled
    Login To Cart
    # ตอนนี้อยู่หน้า PaymentMethod แล้ว
    Wait Until Page Contains    ชำระเงิน    10s
    Element Should Be Disabled    xpath=//button[contains(text(),'ชำระเงิน')]
    Element Attribute Value Should Be    xpath=//button[contains(text(),'ชำระเงิน')]    disabled    true
    Capture Page Screenshot    ${CURDIR}${/}results${/}Payment-Button-Disabled.png
    Close Browser

2. เลือกเงินสดแล้วกด "ชำระเงิน"
    Login To Cart
    Wait Until Page Contains    ชำระเงิน    10s
    Sleep    2s
    # ลองคลิกที่ <p> ข้างใน div "เงินสด"
    Click Element    xpath=//p[text()='เงินสด']
    Sleep    1s
    Click Button    xpath=//button[contains(text(),'ชำระเงิน') and not(@disabled)]
    Sleep    2s
    ${result}=    Run Keyword And Ignore Error    Handle Alert    action=ACCEPT
    Run Keyword If    '${result[0]}' == 'PASS'    Should Be Equal    ${result[1]}    ออเดอร์ถูกสร้างแล้ว
    Run Keyword If    '${result[0]}' == 'FAIL'    Wait Until Page Contains    ออเดอร์ถูกสร้างแล้ว    10s
    Wait Until Page Contains    ชำระเงินสำเร็จ    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Payment-Cash-Success.png
    Close Browser

3. เลือก QR พร้อมเพย์แล้วกด "ชำระเงิน"
    Login To Cart
    Wait Until Page Contains    ชำระเงิน    10s
    # เลือกวิธี "QR พร้อมเพย์"
    Click Element    xpath=//div[contains(@class,'p-4') and .//p[text()='QR พร้อมเพย์']]
    Sleep    1s
    Click Button    xpath=//button[contains(text(),'ชำระเงิน')]
    Wait Until Page Contains    สแกนเพื่อชำระเงิน    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Payment-QR-Popup.png
    Close Browser

4. กดปุ่ม "ยกเลิก"
    Login To Cart
    Wait Until Page Contains    ชำระเงิน    10s
    Sleep    2s
    Click Button    xpath=//button[contains(text(),'ยกเลิก')]
    Sleep    2s
    # ตรวจสอบว่ากลับไปหน้าก่อนหน้า (cart หรือ order)
    Wait Until Page Contains    ตะกร้าสินค้า    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Payment-Cancel.png
    Close Browser

5. กดปุ่ม "กลับ" (ปุ่มบนซ้าย)
    Login To Cart
    Wait Until Page Contains    ชำระเงิน    10s
    Sleep    2s
    Click Button    xpath=//button[contains(text(),'กลับ')]
    Sleep    2s
    # ตรวจสอบว่ากลับไปหน้าก่อนหน้า (cart หรือ order)
    Wait Until Page Contains    ตะกร้าสินค้า    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Payment-Back.png
    Close Browser

6. PaymentSuccess: กด "กลับไปหน้าหลัก"
    Login To Cart
    Wait Until Page Contains    ชำระเงิน    10s
    Sleep    2s
    # ลองคลิกที่ <p> ข้างใน div "เงินสด"
    Click Element    xpath=//p[text()='เงินสด']
    Sleep    1s
    Click Button    xpath=//button[contains(text(),'ชำระเงิน') and not(@disabled)]
    Sleep    2s
    ${result}=    Run Keyword And Ignore Error    Handle Alert    action=ACCEPT
    Run Keyword If    '${result[0]}' == 'PASS'    Should Be Equal    ${result[1]}    ออเดอร์ถูกสร้างแล้ว
    Run Keyword If    '${result[0]}' == 'FAIL'    Wait Until Page Contains    ออเดอร์ถูกสร้างแล้ว    10s
    Wait Until Page Contains    ชำระเงินสำเร็จ    10s
    Click Button    xpath=//button[contains(text(),'กลับไปหน้าหลัก')]
    Sleep    2s
    # ตรวจสอบว่ากลับไปหน้าแรกของระบบ (ตัวอย่าง: มีข้อความ "ร้านนายสมชาย" หรือหน้าแรก)
    Wait Until Page Contains    ร้านนายสมชาย    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Payment-Back-Home.png
    Close Browser