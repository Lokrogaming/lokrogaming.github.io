const fileInput = document.getElementById("csvFile");
const table = document.getElementById("tableBody");
const progress = document.getElementById("progress");


const SHULKER = 1728;
const DOUBLE_CHEST = 3456;


fileInput.addEventListener("change", e => {

    const file = e.target.files[0];

    const reader = new FileReader();


    reader.onload = event => {

        const csv = event.target.result;

        loadCSV(csv);

    };


    reader.readAsText(file);

});



function loadCSV(csv){

    table.innerHTML="";


    let lines = csv.split("\n");


    lines.forEach((line,index)=>{


        if(index===0) return;


        let data=line.split(",");


        if(data.length < 2) return;



        let block=data[0].trim();
        let amount=parseInt(data[1]);



        let row=document.createElement("tr");


        row.innerHTML=`

        <td>
        <input type="checkbox">
        </td>

        <td>${block}</td>

        <td>${amount}</td>

        <td>${Math.ceil(amount/64)}</td>

        <td>
        ${Math.ceil(amount/SHULKER)}
        </td>

        <td>
        ${Math.ceil(amount/DOUBLE_CHEST)}
        </td>

        `;



        let checkbox=row.querySelector("input");


        checkbox.addEventListener("change",()=>{

            row.classList.toggle(
                "done",
                checkbox.checked
            );

            saveProgress();

        });


        table.appendChild(row);


    });


    loadProgress();

}




function saveProgress(){

    let states=[];


    document.querySelectorAll(
        "tbody input"
    ).forEach(box=>{

        states.push(box.checked);

    });


    localStorage.setItem(
        "progress",
        JSON.stringify(states)
    );


    updateProgress();

}



function loadProgress(){

    let saved=
    JSON.parse(
        localStorage.getItem("progress")
    );


    if(!saved)return;


    document
    .querySelectorAll("tbody input")
    .forEach((box,i)=>{

        box.checked=saved[i] || false;

        box.parentElement
        .parentElement
        .classList.toggle(
            "done",
            box.checked
        );

    });


    updateProgress();

}



function updateProgress(){

    let boxes=
    document.querySelectorAll(
        "tbody input"
    );


    let done=
    [...boxes]
    .filter(x=>x.checked)
    .length;


    let percent=
    boxes.length
    ?
    Math.round(done/boxes.length*100)
    :
    0;


    progress.innerText=
    percent+"%";

}