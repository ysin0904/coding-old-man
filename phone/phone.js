const openBtns = document.querySelectorAll('.modal-opener');
const closeBtn = document.getElementById('closeBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalImage = document.getElementById('modalImage');
const contents = {
    'qr': {
        title: 'qr코드 사용법',
        body: '스마트폰에서 기본 카메라 앱을 실행한다.카메라 화면에 QR코드가 잘 보이도록 중앙에 맞춘다.사진 버튼은 누르지 말고 1~2초 정도 가만히 기다린다.화면에 나타난 링크나 안내 문구를 눌러 내용을 확인한다.',
        imageSrc: 'https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fpng&attachment_token=AOo0EEUGRGvMDAP6fdP5bQEWrWWdpiT3PL0FJ9HqPdJJhjw9VJ3ecLtFN1R%2F2%2FNvcwAv01Mmawn5MhKZiBOufPA3bqzVGjauGcFXwjE%2BimjG10t7WKMbRJDgFW7pT7j%2B2nW1iZty9lRs0ecbN%2F9uPQp6iW11iLLsWeEkCzy4mlTYv%2Bl1JWAaCoLgiVPwyQIKQ0RqcibNyMTirfq0s0nr1wADO77EhqbXNd0WlCmYPBTDDSoXnPuUQt2ox2Fnflb8QAqqI1Gpv1LRlLI6424pkVSBWlt1FXQB044Yrtj2RpyOZkLlMHhdAa0oO1KHNpZUv0FNTXuwdj6vhDC8MI%2BRpuKItNc7%2FqV9ey4RKc99n7MspgXgdWQzqnAmJcXMcDaQW7iVIBAMbV9zHDSxBEGEhTdCaS51IbahE4w6N9uIVnBGx9CysKYPXxHWPxrhgNt9GfmAv2lfRX%2B5XDIX76ADwvgxnmAXil7hTr7KN0DGz7E0aeC%2FpNvN%2Fy7oySlW9ndSjUs5TfkWpl7EipibkFsyRkxoCyO8FF3TYLRWNHRrPUxwGzu%2F6npg8E%2BbrAsid5ic02hiisQXtR05qqwvwCTQMIWPHqOuvGDCT%2FrhlR18Xi3TWOgaFUKaoj%2Fz&allow_caching=true&sz=w512'
    },
    'kiosk': {
        title: '키오스크 사용법',
        body: '키오스크는 화면을 눌러 주문과 결제를 하는 기계로, 대기 화면에서는 화면을 가볍게 터치하면 시작됩니다.언어 선택 후 매장 식사나 포장을 고르고, 메뉴 사진을 눌러 옵션을 선택해 장바구니에 담습니다.주문 내용을 확인한 뒤 결제 방법을 선택해 결제하면 주문 번호가 표시됩니다.사용이 어렵거나 오류가 나도 다시 시도하거나 직원에게 도움을 요청하면 된답니다.',
        imageSrc: 'https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fjpeg&attachment_token=AOo0EEWxE32WF14My8cGtKEWrDrvwzLq3se%2BWXumkDo%2BwWTZ4iDSdg0ByQhNWMb%2BoD8Dhh56QpE59XK31tRfJa0T8Bld%2FykZHH%2Bq6D1XXcaP3G5gHsdBlPaCdde1izUxDDp%2BbMjvrn2xBFk1jx%2BDHHWKv8xdkGnc6aUeGX6LCOGNph3NYJ9x9xi7Z8orLVMY2br%2Fzm3qG0%2F6s86Kej4MA0uNYQceFLmJD7MS7jMc%2BSRQN08y2w24IhO8o3oiF%2BQLi4eGe4alRSN5NZV3wBPA3OsH2Xj6r1m5KhD8ZKyzr7vgJRSD66ed6FWECRehJ14PIfYuCGOTvj4CczFU59P6QRHF%2FwodK8lT17kE2692VqRxdW5gFRLESOpIhQcj1XOGVoCU2y7gJPRRC3dslvnnJGGBYFkJwePwlHzGo6KBFys%2F6VFQIFNKukfu1hCTjkuLlE41p%2FYDKOSWkUKggYeQ29heINqVlacv7Ul5txuShEprfek6S4%2FWPCn4bG%2BhJPcZq68bMwxV2EDDXx0%2FjFfwT16c%2FHTeGbEU%2BWgO4TEDOdZn31CQhKSSee3k75VoRL%2FfWB3jn72cO91O96UpoNhnX3%2BNPqUdClq8ew%3D%3D&allow_caching=true&sz=s330-c'
    },
    'remote': {
        title: '리모컨 사용법',
        body: '리모컨 맨 위에 있는 빨간색 동그라미 버튼을 눌러 전원을 켜주세요,방송을 바꿀 땐 숫자나 위·아래로 뾰족한 버튼을 누르세요,소리는 십자가(+)나 막대기(-) 그림이 있는 버튼을 누르세요,잘 안될 때는 이전이나 나가기라고 써진 글자를 찾아 누르세요.',
        imageSrc: 'https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fpng&attachment_token=AOo0EEWA7yQzv%2FWWsV41g%2F2Ra1AsXemlcsiQti9nRce2A49%2BdvGgL%2BEilor%2BohOPXaYujwVPLsqBivWEv7zB1vcxdiMnY8Oe2CZ%2FHFyiyOUNfuzSsZl5Mvo7%2B8H7DH0sdjbpB72LtWic8QznM3u3KS%2F%2FM5NBGKMLOGlraQhgJAHhxFK9GJwmfNAe1PtzWtNT0g%2FGk13XJKPvwRdqfIUc3IYsIsf6S6KrbjHbATZDgRS%2BHOq2Wt%2F1DKXbZO%2FBzjQdoyipDFh4O800ZFfLfc%2F%2Fg%2BXDYHUW3agjA7EsYHcm6WfZfEUsYKzBgVVf%2B5r%2BSs9mTkBGIRablXERJT4g78XqeT81of5mKSvU3AIBd%2B9iETiuiapwGdYIzgOkfKwh%2B0lvRY4Wp3QMA%2FP6IA7M9XoYgrUVW5MciJ68OlkwXyvLEXhjoy%2BkDBkIFNbNNj9f1N3SGGtVREEXZHo9To1AFWkD9ReX6L7qD%2F3s36I%2FTOtcR7sprNu9WCIe%2Fe0tvC37jHZ7PACvFnH%2BGEhJtJ0c1tTYkc4xtI6qDypHMMtzv99snQjdZkdItBSUvyoh6geNZYoItIkzVYyct3dXHw2zCAr9cwAAnHP%2B4VJilwozgUt6B0RoLQ%3D%3D&allow_caching=true&sz=s330-c'
    },
    'atm': {
        title: 'ATM기 사용법',
        body: '기계에 카드나 통장을 넣으신 후, 화면에서 예금출금 이라는 글씨를 찾아 눌러주세요.비밀번호 4자리를 천천히 누르시고, 원하시는 금액(돈 액수)을 선택해 주세요.화면에 나온 내용이 맞으면 확인 버튼을 누르고, 기계가 돈을 셀 때까지 잠시 기다려주세요.기계가 카드를 먼저 뱉어야 돈 나오는 문이 열리니, 꼭 카드를 먼저 챙기시고 나서 현금을 꺼내세요. 카드 사용 방법과 통장 정리 방법, 그리고 보이스피싱 예방 팁도 함께 제공합니다.',
        imageSrc: 'https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fpng&attachment_token=AOo0EEWQMu4QGUEUGYsQI1OiInld6M%2BAX1Tm4vetX5OCMXlAIrNf4Hce8RsRuv7Vi%2FzMRsDv%2BxsopaLBtTJ3nlGHCvNn2xbYn%2FdrAdvxtB%2BlPxHzdsgyGS1Sa5hPuPimiWqRn8Urm3d2s7wtjoD9rh%2Fnana4CQG8NECHS5s7tA5fzT0Wo9RR23jkbep7LzOQwgZjFNaqGwPJbf15C0zGlLJSjM0uSY1KcGDmy7h%2FFjy4uvicjTcSjKH5eknK7YIHw9ehoayzecH3FEpHJ%2BVSUIbbEjVPlAEYdHr%2FF1XnibcBzcUBEDsLNCDtj%2BT9wpm6MO1ZiWl2E6x2Q3sYjWLxeCxVUlIbqC7fcUjLO74xofkegWf7QTmsCmNXCBzED2A8bv7eWJXkSCd3ID4jvdMtsIZ%2F4PuS1vIlIF57AH8LHl6Fyiq6gQ2nPnXlPMXCF6jJddeEu3dm62Aim2ye1hSFoR4HqG2fqMRwYFeiXscalUo1i4M9gR5KRR0hMrsan%2BLteRg%2BdmMDJqq8jk9Q2B7F%2BmvDmTFz831HhwZrldGLLCx5%2FSBNvmPTnoL%2FTg0Irx1ufLp%2Fyx2lk3BrkSpDcdc02aMancxTpFx5xmP4jvw%2FQNqvOhJ%2BYKJkYWbR8PTbEzEH&allow_caching=true&sz=s330-c'
    },
    'bluetooth': {
        title: '블루투스 연결 방법',
        body: '설정에서 블루투스를 켜면 주변 기기를 자동으로 검색한다.연결할 기기를 페어링 모드로 만든 뒤 목록에서 기기 이름을 누른다.“연결됨”이 표시되면 블루투스 연결이 완료된다.',
        imageSrc: 'https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fpng&attachment_token=AOo0EEXwQeGBGB%2BnYllo9%2FUPiGv8y9c17ut3698G%2FRz2nDTEy9P%2BwJfuDdWG2xLLU1DJZsE3EHXrkaUgiBfmHekDRJXvIQgI1jIvI3%2Fcg90Y2b5rExP%2F%2FiGwzCo8r2kz9op1s%2FvHUI%2BB5nB1WEh9jozyQICJGLfs1PHLjFEgGRHL0RKTubSOequgFA8afdwseafn0Dynfg9AJsXjyXQTs2r6X3kVcD1PMznYICkXvcf2aai9%2BGaPT2NpUzL%2F0JQ9JrYv0OI1uxq5H21Sla3JvFbAW95DJUvuwe3BEUxRTwdNu8qPOlqXX2svOvI8d%2F7zKLOyYJOGdeeL20o1HYrbBVdKmECRFOujGpXNpmGqh0tb%2FYz5RbBlondpcDqdV%2FHamai0e2Dj984g%2Bzs4zS0bryea8J6EajNjpVCSANFBN7FA2%2FEX4AglnUmmBDzsgWju4r59OyP2Fn1RGXCFITLbgmFoaJaGtyrKsrLXoHrpzwrGB7%2FmmMeFWonazh8GJnvPGIBO2oH1fOcqOHGpbDY9%2FE33F%2FpEOO%2BQDLHvpj0Lb4NwuXxcavbUg9m3QgUUjpsgTPa%2FG4ViCM5Cun1TVHLiLgqFsPmShg%2F2DBKHL2pPDWaTe8kiBtUQ4HWPDm%2BBx%2BmYao6w40q6mSHC%2FXk%3D&allow_caching=true&sz=w512'
    },
    'call': {
        title: '모바일 메신저 사용법',
        body: '카카오톡, 문자 메시지 등 모바일 메신저를 이용하여 가족 및 지인들과 소통하는 방법을 배웁니다. 사진/동영상 보내기, 그룹 채팅, 영상 통화 등 실생활에 유용한 기능을 중심으로 교육합니다.',
        imageSrc: 'https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fpng&attachment_token=AOo0EEVNFOM8dGeO8IajhBKKrObs%2FKQmVLIPXTwd3bW0zGw59NqeAxwNALkaTGxVPYocCIAovCWIY7Gdjf3GHOmESs00WSG8EDz%2FE0eXdwcW3dGpF8u9jUMO7kV7vmLOJy9olJgKQ42UQqllU0icQF5MhKZr3GSvAKaDs0i8C07MQEtmkCbwljCFtRhc2rKNG28YdhAUU8jrcTMDT0bGyOqxHO%2FJVgj0sNjO7D%2BZHUHNWgw8z%2FTzLNS0uSCvNt5oc0%2FHWwLfzxQnsvwRqVw7cPwct%2B3Ofx%2FezP6ztX%2FKIX%2Be3W9dfF7UN2QoQFbEhfFRTS0uTZ1C45zaM%2BFhnmHasWNsRwmYF1bJpB04dgnjOSTrTHaZHeHSj3v7lNlBIIaGrv4yiZqJNNMQ%2BMwrIQ5k8Fg64AiWfjYMQdHWJC26bewhcILMvARdbWMmSvG1YjrsOGRxDYM7%2FzXro1Z5M5Obtq%2Fkaad%2FTJdqogbjzB12XapoqVA%2BdhtS2zXGRDiHH8MrvfrtNKv9Dg7x2M23S8s82ESL%2BcoCa4%2Bb2LAaTn%2F8cqegy%2BpcG93z3NGw4MUOUQYS4iXhWmLHo%2FMFHf4C43ubUiQiYANwepmiqVpgaomH&allow_caching=true&sz=s330-c'
    }
};
openBtns.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');
        const data = contents[target];
        
        if (data) {
            modalTitle.textContent = data.title;
            modalBody.textContent = data.body;
            if (data.imageSrc) {
                modalImage.src = data.imageSrc;
                modalImage.style.display = 'block';
                modalImage.onerror = () => {
                    modalImage.style.display = 'none';
                    console.error("Failed to load image for: " + data.title);
                };
            } else {
                modalImage.style.display = 'none';
                modalImage.src = ''; 
            }

            modalOverlay.style.display = 'flex';
        }
    });
});
closeBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
});
