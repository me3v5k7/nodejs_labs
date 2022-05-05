const loadAllProfiles = function(){
    let profiles = document.getElementsByClassName("profile");
    for (let i = 0; i < profiles.length; i++){
        if (!profiles[i].data_id){
            profiles[i].data_id = 0;
        }
        loadProfile(profiles[i]);
    }
}

const loadProfile = function(profile){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/get_profile_info", true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function(){
        let responce = JSON.parse(xhr.responseText);
        if (responce.id){
            profile.getElementsByClassName("profile_create_button")[0].classList.add("disabled")
            profile.getElementsByClassName("profile_change_image_form")[0].classList.remove("disabled")

            profile.getElementsByClassName("profile_id")[0].innerHTML = "№" + responce.id;
            profile.getElementsByClassName("profile_post_id_param")[0].value = responce.id;
            profile.getElementsByClassName("profile_name")[0].innerHTML = responce.name;
            profile.getElementsByClassName("profile_work_name")[0].innerHTML = responce.proffesion;
            profile.getElementsByClassName("profile_img")[0].src = responce.image_url;
            

            let inside_html = "";
            for (let i = 0; i < responce.entries.length; i++){
                inside_html += `<div class="profile_regiter_entry">
                    <p class="profile_regiter_entry_date">${responce.entries[i].date}</p>
                    <p class="profile_regiter_entry_text">${responce.entries[i].text}</p>
                </div>
                `
            }
            profile.getElementsByClassName("profile_register")[0].innerHTML = inside_html;
            
        } else {
            profile.getElementsByClassName("profile_create_button")[0].classList.remove("disabled")
            profile.getElementsByClassName("profile_change_image_form")[0].classList.add("disabled")

            profile.getElementsByClassName("profile_id")[0].innerHTML = "№ not found";
            profile.getElementsByClassName("profile_post_id_param")[0].value = "";
            profile.getElementsByClassName("profile_name")[0].innerHTML = "";
            profile.getElementsByClassName("profile_work_name")[0].innerHTML = "";
            profile.getElementsByClassName("profile_img")[0].src = "/src/error.jpg";

            profile.getElementsByClassName("profile_register")[0].innerHTML = "";
        }
    };

    xhr.send(
        `
        {"id" : "${profile.data_id}"}
        `
    );
};

const changeProfile = function(profile){
    let profile_id = profile.getElementsByClassName("profile_chooser")[0].children[0].value;
    profile.data_id = profile_id
    loadProfile(profile);
};

const submitForm = function(event){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/set_profile_image", true);
    
    xhr.onload = function(){
        loadAllProfiles()
    };

    xhr.send(new FormData(event.target));
    event.preventDefault();
};

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


document.addEventListener("DOMContentLoaded", function(){
    loadAllProfiles()
    
    let froms = document.getElementsByClassName("profile_change_image_form");
    for (let i = 0; i < froms.length; i++){
        froms[i].addEventListener("submit", submitForm);
    };
});