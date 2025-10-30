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
    Go To    ${URL}/admin/employees
    Wait Until Page Contains    จัดการข้อมูลพนักงาน    10s

*** Test Cases ***
1. แสดงรายการพนักงาน
    Admin Login
    Sleep    2s
    Element Should Be Visible    xpath=//table
    Element Should Contain    xpath=//table    ชื่อเต็ม
    Element Should Contain    xpath=//table    ตำแหน่ง
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-List.png
    Close Browser

2. เพิ่มพนักงานใหม่
    Admin Login
    Sleep    2s
    Input Text    xpath=//input[@placeholder='ชื่อเต็ม']    test employee
    Input Text    xpath=//input[@placeholder='ตำแหน่ง']    พนักงานเสิร์ฟ
    Input Text    xpath=//input[@placeholder='เงินเดือน']    7500
    Input Text    xpath=//input[@placeholder='เบอร์โทร']    0812345678
    Click Button    xpath=//button[contains(text(),'สร้าง')]
    Wait Until Page Contains    test employee    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-Add.png
    Close Browser

3. เพิ่มพนักงานโดยไม่กรอกข้อมูลครบ
    Admin Login
    Sleep    2s
    Input Text    xpath=//input[@placeholder='ชื่อเต็ม']    ทดสอบ ข้อมูลไม่ครบ
    # ไม่กรอกตำแหน่ง
    Input Text    xpath=//input[@placeholder='เงินเดือน']    12000
    Click Button    xpath=//button[contains(text(),'สร้าง')]
    Wait Until Page Contains    กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อเต็ม, ตำแหน่ง และเงินเดือน    5s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-Add-Invalid.png
    Close Browser

4. แก้ไขข้อมูลพนักงาน
    Admin Login
    Sleep    2s
    Click Button    xpath=//tr[td[contains(text(),'test employee')]]//button[contains(text(),'แก้ไข')]
    Input Text      xpath=//tr[td/input[@value='test employee']]//input[@value='พนักงานเสิร์ฟ']    หัวหน้าแผนก
    Click Button    xpath=//button[contains(text(),'บันทึก')]
    Wait Until Page Contains    หัวหน้าแผนก    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-Edit.png
    Close Browser

5. กดยกเลิกใน modal ยืนยันลบ
    Admin Login
    Sleep    2s
    Click Button    xpath=//tr[td[contains(text(),'test employee')]]//button[contains(text(),'ลบ')]
    Wait Until Page Contains    ยืนยันการลบพนักงาน    5s
    # รอปุ่ม "ยกเลิก" ใน modal โผล่
    Sleep    2s
    Wait Until Element Is Visible    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ยกเลิก')]    5s
    # คลิกปุ่ม "ยกเลิก" ใน modal
    Click Button    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ยกเลิก')]
    Wait Until Page Contains    test employee    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-Delete-Cancel.png
    Close Browser

6. ลบพนักงาน
    Admin Login
    Sleep    2s
    Click Button    xpath=//tr[td[contains(text(),'test employee')]]//button[contains(text(),'ลบ')]
    Wait Until Page Contains    ยืนยันการลบพนักงาน    5s
    # รอปุ่ม "ลบ" ใน modal โผล่
    Sleep    2s
    Wait Until Element Is Visible    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ลบ')]    5s
    # คลิกปุ่ม "ลบ" ใน modal
    Click Button    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ลบ')]
    Wait Until Page Does Not Contain    test employee    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-Delete.png
    Close Browser

7. Logout
    Admin Login
    Sleep    2s
    Click Button    xpath=//button[contains(text(),'Logout')]
    Wait Until Page Contains    Login    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Employees-Logout.png
    Close Browser
