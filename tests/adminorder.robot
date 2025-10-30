*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Keywords ***
Admin Login
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    Dashboard    10s
    Go To    ${URL}/admin/orders
    Wait Until Page Contains    Orders    10s

*** Test Cases ***
1. แสดงสถานะออเดอร์แต่ละแบบ
    Admin Login
    # ตรวจสอบว่ามีออเดอร์สถานะ pending, completed, cancelled
    Wait Until Page Contains    pending    2s
    Wait Until Page Contains    completed    2s
    Wait Until Page Contains    cancelled    2s
    Element Should Be Visible    xpath=//span[contains(text(),'pending')]
    Element Should Be Visible    xpath=//span[contains(text(),'completed')]
    Element Should Be Visible    xpath=//span[contains(text(),'cancelled')]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Admin-Order-Status.png
    Close Browser

2. ดูรายละเอียดออเดอร์ (pending)
    Admin Login
    # คลิกปุ่ม "ดูรายละเอียด" ของออเดอร์ pending
    Sleep    2s
    Click Button    xpath=//div[.//span[contains(text(),'pending')] and .//button[contains(text(),'ดูรายละเอียด')]]//button[contains(text(),'ดูรายละเอียด')]
    Wait Until Page Contains    รายการอาหาร    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Admin-Order-Detail.png
    Close Browser

3. กด "เสร็จสิ้น" ใน popup รายการอาหาร
    Admin Login
    Sleep    2s
    Click Button    xpath=//div[.//span[contains(text(),'pending')] and .//button[contains(text(),'ดูรายละเอียด')]]//button[contains(text(),'ดูรายละเอียด')]
    Wait Until Page Contains    รายการอาหาร    10s
    Sleep    2s
    Capture Page Screenshot    ${CURDIR}${/}results${/}after-popup.png
    Wait Until Element Is Visible    xpath=//body//button[contains(normalize-space(text()),'เสร็จสิ้น')]    10s
    Click Button    xpath=//body//button[contains(normalize-space(text()),'เสร็จสิ้น')]
    Run Keyword And Ignore Error    Click Button    xpath=//button[contains(normalize-space(text()),'ยืนยัน')]
    Wait Until Page Contains    completed    10s
    Close Browser

4. กด "ยกเลิก" ใน popup รายการอาหาร
    Admin Login
    Sleep    2s
    Click Button    xpath=//div[.//span[contains(text(),'pending')] and .//button[contains(text(),'ดูรายละเอียด')]]//button[contains(text(),'ดูรายละเอียด')]
    Wait Until Page Contains    รายการอาหาร    10s
    Sleep    2s
    Capture Page Screenshot    ${CURDIR}${/}results${/}after-popup-cancel.png
    Wait Until Element Is Visible    xpath=//body//button[contains(normalize-space(text()),'ยกเลิก')]    10s
    Click Button    xpath=//body//button[contains(normalize-space(text()),'ยกเลิก')]
    Run Keyword And Ignore Error    Click Button    xpath=//button[contains(normalize-space(text()),'ยืนยัน')]
    Wait Until Page Contains    cancelled    10s
    Close Browser

5. กด "ปิด" ใน popup รายการอาหาร
    Admin Login
    Sleep    2s
    Click Button    xpath=//div[.//span[contains(text(),'pending')] and .//button[contains(text(),'ดูรายละเอียด')]]//button[contains(text(),'ดูรายละเอียด')]
    Wait Until Page Contains    รายการอาหาร    10s
    Click Button    xpath=//button[normalize-space(text())='ปิด']
    Sleep    1s
    Element Should Not Be Visible    xpath=//div[contains(text(),'รายการอาหาร')]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Admin-Order-Close.png
    Close Browser

6. กด "Logout"
    Admin Login
    Sleep    2s
    Click Button    xpath=//button[contains(text(),'Logout')]
    Wait Until Page Contains    Login    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Admin-Logout.png
    Close Browser
