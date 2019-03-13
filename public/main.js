function pozovi(){
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200){
            var ids=JSON.parse(ajax.response);
            var generisi="";
            for(var i=0;i<ids.length;i++){     
                generisi+=`
                <form action="/ledr/${ids[i]}" method="POST">
                    <input class="m-2 btn btn-danger" type="submit" value="RED">
                </form>
                
                <form action="/ledg/${ids[i]}" method="POST">
                    <input class="m-2 btn btn-success" type="submit" value="GREEN">
                </form>
                
                <form action="/ledb/${ids[i]}" method="POST">
                    <input class="m-2 btn btn-primary" type="submit" value="BLUE">
                </form>
                
                <form action="/lock/${ids[i]}" method="POST">
                    <input class="m-2 btn btn-secondary" type="submit" value="LOCK">
                </form>
                
                <form action="/unlock/${ids[i]}" method="POST">
                    <input class="m-2 btn btn-secondary" type="submit" value="UNLOCK">
                </form>
                
                <form action="/buzz/${ids[i]}" method="POST">
                    <input class="m-2 btn btn-secondary" type="submit" value="BUZZ">
                </form>
                
                `;
            }
            document.getElementById("maindiv").innerHTML = generisi;
        }
    }
    ajax.open("GET", "http://localhost:8080/devices", true);
    ajax.send();
}
pozovi();
