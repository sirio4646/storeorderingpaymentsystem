*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    String

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173/register
${BROWSER}    Edge

*** Test Cases ***
1. ทดสอบการสมัครสมาชิกสำเร็จ
    ${rand}=    Generate Random String    6    [LETTERS]
    ${username}=    Set Variable    testuser${rand}
    ${password}=    Set Variable    testpass${rand}
    ${email}=    Set Variable    ${username}@example.com
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Register    10s
    Input Text    xpath=//input[@placeholder='Username']    ${username}
    Input Text    xpath=//input[@placeholder='Password']    ${password}
    Input Text    xpath=//input[@placeholder='Email (สำหรับร้านค้า)']    ${email}
    Click Button    xpath=//button[contains(text(),'Register')]
    Wait Until Page Contains    Register successful!    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Register-Success-${rand}.png
    Close Browser

2. ทดสอบการสมัครสมาชิกซ้ำ (username/email ที่มีแล้ว)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Register    10s
    Input Text    xpath=//input[@placeholder='Username']    test1
    Input Text    xpath=//input[@placeholder='Password']    123456
    Input Text    xpath=//input[@placeholder='Email (สำหรับร้านค้า)']    test1@gmail.com
    Click Button    xpath=//button[contains(text(),'Register')]
    Wait Until Page Contains    Username already exists    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Register-Fail.png
    Close Browser

3. ทดสอบการสมัครสมาชิกโดยไม่กรอกข้อมูล (ฟิลด์ว่าง)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Register    10s
    Click Button    xpath=//button[contains(text(),'Register')]
    # ตรวจสอบว่ายังอยู่หน้า Register (ไม่ได้ redirect)
    Wait Until Page Contains    Register    5s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Register-Empty-Fields.png
    Close Browser