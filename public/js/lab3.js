const loadProfile = function(profile){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/get_profile_info", true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function(){
        let responce = JSON.parse(xhr.responseText);
        if (responce.id){
            profile.getElementsByClassName("profile_change_image_form")[0].classList.remove("disabled")

            profile.getElementsByClassName("profile_title")[0].innerHTML = "Особова справа №" + responce.id;
            let form_params = profile.getElementsByClassName("profile_post_id_param");
            for (let i = 0; i < form_params.length; i++){
                form_params[i].value = responce.id;
            }
            
            profile.getElementsByClassName("profile_name")[0].innerHTML = responce.name;
            profile.getElementsByClassName("profile_work_name")[0].innerHTML = responce.proffesion;
            profile.getElementsByClassName("profile_img")[0].src = responce.image_url;
            

            let inside_html = "";
            for (let i = 0; i < responce.entries.length; i++){
                inside_html += `<div class="profile_regiter_entry">
                    <p class="profile_regiter_entry_date">${responce.entries[i].date}</p>
                    <p class="profile_regiter_entry_text">${responce.entries[i].text}</p>
                    <button onclick="deleteRegisterEntry(this.parentElement.parentElement.parentElement, ${i})">Видалити</button>
                </div>
                `
            }
            profile.getElementsByClassName("profile_register")[0].innerHTML = inside_html;
            
        } else {
            profile.getElementsByClassName("profile_change_image_form")[0].classList.add("disabled")

            profile.getElementsByClassName("profile_title")[0].innerHTML = "Особова справа № not found";
            profile.getElementsByClassName("profile_post_id_param")[0].value = "";
            profile.getElementsByClassName("profile_name")[0].innerHTML = "";
            profile.getElementsByClassName("profile_work_name")[0].innerHTML = "";
            profile.getElementsByClassName("profile_img")[0].src = "/src/error.jpg";

            profile.getElementsByClassName("profile_register")[0].innerHTML = "";
        }
    }

    xhr.send(
        `
        {"id" : "${profile.data_id}"}
        `
    );
}

let edit_mode = false
const editProfile = function(profile){
    if (edit_mode){
        profile.classList.remove("disabled");
        
        profile.getElementsByClassName("profile_editor")[0].classList.add("hidden");
    }
    else {
        profile.classList.add("disabled");
        profile.getElementsByClassName("profile_editor")[0].classList.remove("hidden");
    }
    edit_mode = !edit_mode;
}

const changeProfile2 = function(profile, profile_id){
    profile.data_id = profile_id
    loadProfile(profile);
};

const loadDropdownMenu = function(profile){
    profile.getElementsByClassName("profile_chooser")[0];

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/get_profiles", true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function(){
        let responce = JSON.parse(xhr.responseText);
        let dropdown_html = "";
        for (let i = 0; i < responce.length; i++){
            dropdown_html += `<a class="noselect" onclick="changeProfile2(this.parentElement.parentElement.parentElement.parentElement, ${responce[i].id})">№${responce[i].id} ${responce[i].name}</a>`;
        }
        profile.getElementsByClassName("dropdown-content")[0].innerHTML = dropdown_html;
    }
    
    xhr.send();
}

const submitChangeImageForm = function(event){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/set_profile_image", true);
    
    xhr.onload = function(){
        loadAllProfiles()
    }
    xhr.send(new FormData(event.target));
    event.preventDefault();
}

const submitChangeNameForm = function(event){
    event.preventDefault();
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/set_profile_name", true);
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){
        loadAllProfiles();
    }

    const json = Object.fromEntries(new FormData(event.target).entries());
    xhr.send(JSON.stringify(json));
}

const submitChangeWorkNameForm = function(event){
    event.preventDefault();
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/set_profile_work_name", true);
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){
        loadAllProfiles();
    }
    const json = Object.fromEntries(new FormData(event.target).entries());
    xhr.send(JSON.stringify(json));
    
}

const createProfile = function(profile_element){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/create_profile", true);

    
    
    xhr.onload = function(){
        let responce = JSON.parse(xhr.responseText);
        profile_element.data_id = parseInt(responce.new_id);
        profile_element.getElementsByClassName("profile_chooser_number_input")[0].value = profile_element.data_id;
        loadProfile(profile_element);
    };

    xhr.send();
}

const deleteRegisterEntry = function(profile, register_entry_id){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/delete_register_entry", true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){
        loadProfile(profile);
    }

    xhr.send(
       `{"profile_id" : "${profile.data_id}", "entry_id": "${register_entry_id}"}`
    );
}

const addRegisterEntry = function(profile){
    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/add_register_entry", true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){
        loadProfile(profile);
    }

    xhr.send(
       `{"profile_id" : "${profile.data_id}", "text" : "${profile.getElementsByClassName("profile_entry_creation_text")[0].value}"}`
    );
}

const loadAllProfiles = function(){
    let profiles = document.getElementsByClassName("profile");
    for (let i = 0; i < profiles.length; i++){
        if (!profiles[i].data_id){
            profiles[i].data_id = 0;
        }
        loadProfile(profiles[i]);
        loadDropdownMenu(profiles[i]);
        profiles[i].getElementsByClassName("profile_change_image_form")[0].addEventListener("submit", submitChangeImageForm);
        profiles[i].getElementsByClassName("profile_change_name_form")[0].addEventListener("submit", submitChangeNameForm);
        profiles[i].getElementsByClassName("profile_change_work_name_form")[0].addEventListener("submit", submitChangeWorkNameForm);
    }
}


document.addEventListener("DOMContentLoaded", function(){
    loadAllProfiles();
});