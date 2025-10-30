*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    DateTime

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Test Cases ***
1. ทดสอบการล็อกอินถูกต้อง(หน้าAdmin)
    Open Browser    ${URL}    ${BROWSER}
    # รอให้หน้าเว็บโหลดเสร็จ
    Wait Until Page Contains    Login    10s
    # ใส่ username/password โดยใช้ placeholder
    Input Text    xpath=//input[@placeholder='Username']    test1
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    # ตรวจสอบผลลัพธ์
    Wait Until Page Contains    Dashboard    10s
    # รอ 3 วินาทีก่อนปิดบราวเซอร์
    Sleep    3s
    # ถ่าย screenshot ก่อนปิดบราวเซอร์
    Capture Page Screenshot    ${CURDIR}${/}results${/}Admin-Login-Test.png
    Close Browser

2. ทดสอบการล็อกอินถูกต้อง(หน้าUser)
    Open Browser    ${URL}    ${BROWSER}
    # รอให้หน้าเว็บโหลดเสร็จ
    Wait Until Page Contains    Login    10s
    # ใส่ username/password โดยใช้ placeholder
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    # ตรวจสอบผลลัพธ์
    Wait Until Page Contains    ร้านนายสมชาย    10s
    # รอ 3 วินาทีก่อนปิดบราวเซอร์
    Sleep    3s
    # ถ่าย screenshot ก่อนปิดบราวเซอร์
    Capture Page Screenshot    ${CURDIR}${/}results${/}User-Login-Test.png
    Close Browser

3. ทดสอบการล็อกอินผิด (username ผิด)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    wrongusername
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    # ถ้ามี alert เด้งขึ้นมา ให้ปิด
    Handle Alert    action=ACCEPT
    # ตรวจสอบว่ายังอยู่หน้า Login
    Wait Until Page Contains    Login    10s
    Sleep    3s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Failed-Login-Test.png
    Close Browser

4. ทดสอบการล็อกอินผิด (password ผิด)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1
    Input Text    xpath=//input[@placeholder='Password']    wrongpassword
    Click Button    xpath=//button[contains(text(),'Login')]
    Handle Alert    action=ACCEPT
    Wait Until Page Contains    Login    10s
    Sleep    3s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Failed-Login-Test.png
    Close Browser