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
    Sleep    2s

*** Test Cases ***
1. แสดงยอดขายรวม
    Admin Login
    Element Should Be Visible    xpath=//p[contains(text(),'ยอดขายรวม')]
    # ตรวจสอบว่ามีตัวเลขยอดขายรวม (เช่น 1,000.00 บาท) ใน parent เดียวกัน
    Element Should Contain    xpath=//p[contains(text(),'ยอดขายรวม')]/parent::*    บาท
    Capture Page Screenshot    ${CURDIR}${/}results${/}Dashboard-TotalSales.png
    Close Browser

2. แสดง Top 5 สินค้าขายดี
    Admin Login
    Element Should Be Visible    xpath=//p[contains(text(),'Top 5 สินค้าขายดี')]
    Element Should Be Visible    xpath=//table
    # ตรวจสอบว่ามีชื่อสินค้าในตาราง
    Element Should Contain    xpath=//tbody    ข้าวผัดหมู
    Element Should Contain    xpath=//tbody    ข้าวกะเพราหมูสับ
    Element Should Contain    xpath=//tbody    ข้าวไก่กระเทียม
    Element Should Contain    xpath=//tbody    ข้าวไข่เจียวหมูสับ
    Element Should Contain    xpath=//tbody    กล้วยบวชชี
    Capture Page Screenshot    ${CURDIR}${/}results${/}Dashboard-Top5.png
    Close Browser

3. แสดงกราฟรายได้ตามประเภทเมนู
    Admin Login
    Element Should Be Visible    xpath=//p[contains(text(),'รายได้ตามประเภทเมนู')]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Dashboard-CategorySales.png
    Close Browser

4. กด Logout
    Admin Login
    Click Button    xpath=//button[contains(text(),'Logout')]
    Wait Until Page Contains    Login    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Dashboard-Logout.png
    Close Browser
