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
    Go To    ${URL}/admin/tables
    Wait Until Page Contains    จัดการสถานะโต๊ะ    10s
    Sleep    2s

*** Test Cases ***
1. แสดงรายการโต๊ะ
    Admin Login
    Element Should Be Visible    xpath=//table
    Element Should Contain    xpath=//table    หมายเลขโต๊ะ
    Element Should Contain    xpath=//table    สถานะ
    Element Should Contain    xpath=//table    จำนวนที่นั่ง
    Element Should Contain    xpath=//table    เปลี่ยนสถานะ
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-List.png
    Close Browser

2. แสดงสถานะโต๊ะ (ว่าง/ไม่ว่าง)
    Admin Login
    Element Should Be Visible    xpath=//span[normalize-space(text())='ว่าง']
    Element Should Be Visible    xpath=//span[normalize-space(text())='ไม่ว่าง']
    ${class_free}=    Get Element Attribute    xpath=//span[normalize-space(text())='ว่าง']    class
    Should Contain    ${class_free}    bg-green-100
    ${class_occ}=    Get Element Attribute    xpath=//span[normalize-space(text())='ไม่ว่าง']    class
    Should Contain    ${class_occ}    bg-red-100
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Status.png
    Close Browser

3. เปลี่ยนสถานะโต๊ะจาก "ว่าง" เป็น "ไม่ว่าง"
    Admin Login
    # คลิกปุ่ม "ปิดโต๊ะ" ในแถวที่สถานะ "ว่าง"
    Click Button    xpath=//tr[.//span[normalize-space(text())='ว่าง']]//button[contains(text(),'ปิดโต๊ะ')]
    Sleep    1s
    # ตรวจสอบว่าสถานะเปลี่ยนเป็น "ไม่ว่าง" และปุ่มเปลี่ยนเป็น "เปิดโต๊ะ"
    Element Should Be Visible    xpath=//tr[.//span[normalize-space(text())='ไม่ว่าง']]//button[contains(text(),'เปิดโต๊ะ')]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Change-To-Occupied.png
    Close Browser

4. เปลี่ยนสถานะโต๊ะจาก "ไม่ว่าง" เป็น "ว่าง"
    Admin Login
    # คลิกปุ่ม "เปิดโต๊ะ" ในแถวที่สถานะ "ไม่ว่าง"
    Click Button    xpath=//tr[.//span[normalize-space(text())='ไม่ว่าง']]//button[contains(text(),'เปิดโต๊ะ')]
    Sleep    1s
    # ตรวจสอบว่าสถานะเปลี่ยนเป็น "ว่าง" และปุ่มเปลี่ยนเป็น "ปิดโต๊ะ"
    Element Should Be Visible    xpath=//tr[.//span[normalize-space(text())='ว่าง']]//button[contains(text(),'ปิดโต๊ะ')]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Change-To-Free.png
    Close Browser

5. กด Logout
    Admin Login
    Click Button    xpath=//button[contains(text(),'Logout')]
    Wait Until Page Contains    Login    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Logout.png
    Close Browser
