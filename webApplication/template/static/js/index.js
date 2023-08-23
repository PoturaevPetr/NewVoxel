$(document).ready(function() {
    function make_rnd(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function load_folders() {
        $.ajax({
            type: "GET",
            url: '/get_images_folder',
            contentType: false,
            proccesData: false,
            success: (data) => {
                var folders = data['folders']
                $('#select_folder').empty()
                var option_folder = document.createElement('option')
                option_folder.setAttribute('id', 'folder_' + -1)
                option_folder.setAttribute('value', undefined)
                option_folder.innerHTML = "Выбрать датасет"
                $('#select_folder').append(option_folder)
                for (var i = 0; i < folders.length; i++) {
                    var option_folder = document.createElement('option')
                    option_folder.setAttribute('id', 'folder_' + i)
                    option_folder.setAttribute('value', folders[i])

                    var row = document.createElement('div')
                    row.setAttribute('class', 'row')

                    var text = document.createElement('h6')
                    text.innerHTML = folders[i]
                    var span = document.createElement('span')
                    span.setAttribute('class', 'text-danger')
                    span.setAttribute('style', 'color: red')
                    span.innerHTML = data['pictures'][folders[i]]
                    text.appendChild(span)
                    row.appendChild(text)
                    option_folder.appendChild(row)
                    $('#select_folder').append(option_folder)
                }
            }
        })
    }
    function load_metrics() {
        $.ajax({
            type: "GET",
            url: "/get_metrics",
            contentType: false,
            proccesData: false,
            success: (data) => {
                var metrics = data['metrics']
                for (var i = 0; i < metrics.length; i++) {
                    var option = document.createElement('option')
                    option.setAttribute('value', metrics[i])
                    option.innerHTML = metrics[i]
                    $('#metric').append(option)
                }
            }     
        })
    }
    function load_images() {
        var folder = $('#select_folder').find(':selected').attr('value')
        $.ajax({
            type: "GET",
            url: '/get_images_file/' + folder,
            contentType: false,
            proccesData: false,
            success: (data) => {
                var pictures = data['pictures']
                $('#images_box').empty()
                $('#type_checkboxs').empty()
                var label = []
                if (data['status'] == "success") {
                    for (var i = 0; i < pictures.length; i++) {
                        if (label.indexOf(pictures[i]['type']) == '-1') {
                            label.push(pictures[i]['type'])
                        }
                        var div_img = document.createElement('div')
                        div_img.setAttribute('class', 'card col-3 p-0')

                        var img = document.createElement('img')
                        img.setAttribute('src',  '/img_umap/' + data['folder'] + '/' + pictures[i]['type'] + '/' + pictures[i]['name'] + "?" + make_rnd(8))
                        img.setAttribute('class', 'w-100')
                        img.setAttribute('id', 'img_umap')
                        img.setAttribute('pic_name', pictures[i]['name'])
                        img.setAttribute('label_type', pictures[i]['type'])
                        img.setAttribute('tooltip', pictures[i]['name'])

                        var labelname = document.createElement('h5')
                        labelname.innerHTML = pictures[i]['type']
                        labelname.setAttribute('class', 'bg-primary rounded text-white text-center w-50')
                        labelname.setAttribute('style', 'position: relative; top: 80%; left: 3%')

                        var filename = document.createElement('label')
                        filename.setAttribute('class', 'text-secondary text-center')
                        filename.innerHTML = pictures[i]['name']
                        div_img.appendChild(labelname)
                        div_img.appendChild(img)
                        div_img.appendChild(filename)
                        
                        $('#images_box').append(div_img)
                    }
                    for (var i = 0; i < label.length; i++) {
                        var div_check_type = document.createElement('div')
                        div_check_type.setAttribute('class', 'form-check form-check-inline')
                        var check_type = document.createElement('input')
                        check_type.setAttribute('type', 'checkbox')
                        check_type.setAttribute('class', 'form-check-input check_label_image')
                        check_type.setAttribute('id', 'check_type_'+ i)
                        check_type.setAttribute('value', label[i])
                        $(check_type).prop('checked', true)
                        var label_type = document.createElement('label')
                        label_type.setAttribute('class', 'form-check-label')
                        label_type.setAttribute('for', 'check_type_' + i)
                        label_type.innerHTML = label[i]
                        div_check_type.append(check_type)
                        div_check_type.append(label_type)
                        $('#type_checkboxs').append(div_check_type)
                    }
                    
                    $('#success_message').text(data['message'])
                    $('#success_message').slideDown(500)
                    $('#success_message').delay(3000).slideUp()
                } 
            }
        })  
    }

    function load_umap(folder, metric, n_components, n_neighbors) {
        if (folder == undefined) {
            folder = $('#select_folder').find(':selected').attr('value')
        }
        if (metric == undefined) {
            metric = 'euclidean'
        }
        if (n_components == undefined) {
            n_components = $('#n_components').attr('value')
        }
        if (n_neighbors == undefined) {
            n_neighbors = $('#n_neighbors').attr('value')
        }
        $.ajax({
            type: "GET",
            url: '/calculate_umap?folder=' + folder + '&metric=' + metric + '&n_components=' + n_components + '&n_neighbors=' + n_neighbors,
            contentType: false,
            proccesData: false,
            success: (data) => {
                var data_umap = data['data']['data']
                if (data['status'] == "success") {
                    $('#success_message').text(data['message'])
                    $('#success_message').slideDown(500)
                    $('#success_message').delay(3000).slideUp()

                    var data_plot = {}
                    for (var i = 0; i < data_umap.length; i++) {
                        data_plot[data_umap[i]['label']] = {}
                    }
                    for (var i = 0; i < data_umap.length; i++) {
                        data_plot[data_umap[i]['label']]['data_xs'] = []
                        data_plot[data_umap[i]['label']]['data_ys'] = []
                        data_plot[data_umap[i]['label']]['type'] = []
                        data_plot[data_umap[i]['label']]['name'] = []
                    }
                    for (var i = 0; i < data_umap.length; i++) {
                        data_plot[data_umap[i]['label']]['data_xs'].push(data_umap[i]['x'])
                        data_plot[data_umap[i]['label']]['data_ys'].push(data_umap[i]['y'])
                        data_plot[data_umap[i]['label']]['type'].push(data_umap[i]['label'])
                        data_plot[data_umap[i]['label']]['name'].push(data_umap[i]['file_name'])
                    }
                    plot_umap(data_plot)
                } else {
                    $('#error_message').text(data['message'])
                    $('#error_message').slideDown(500)
                    $('#error_message').delay(3000).slideUp()
                }
                
            }
        })
    }
    function plot_umap(data_plot) {
        
        var data = []
        var key_type = Object.keys(data_plot)
        for (var i = 0; i < key_type.length; i++) {
            var trace = {
                x: data_plot[key_type[i]]['data_xs'],
                y: data_plot[key_type[i]]['data_ys'],
                mode: 'markers',
                type: 'scatter',
                filename: data_plot[key_type[i]]['name'],
                name: key_type[i],
                label: key_type[i],
                marker: { size: 12 }
            }
            data.push(trace)
        }
        var layout = {
            title:'UMAP Chart'
        };

        Plotly.newPlot('umap_box', data, layout);
    }
    load_folders()
    load_images()
    //load_umap()
    load_metrics()

    $(document).on('click', '#img_umap', function(e) {
        $('#modal_img').modal('toggle')
        $('#img_show').attr('src', $(e.target).attr('src'))
        $('#img_name').text($(e.target).attr('pic_name'))
    })
    $("#select_folder").on('change', function() {
        load_images()
    });

    $("#calculate_umap").on('click', function() {
        folder = $('#select_folder').find(':selected').attr('value')
        metric = $('#metric').find(':selected').attr('value')
        n_components = $('#n_components').val()
        n_neighbors = $('#n_neighbors').val()
        load_umap(folder, metric, n_components, n_neighbors)
    })

    $('#umap_box').on('plotly_selected', function(e) {
        var data = e.target.data
        var data_selected = []
        for (type_number in data) {
            var type_data = data[type_number]
            var points_selected = type_data['selectedpoints']
            for (var i = 0; i < points_selected.length; i++) {
                data_selected.push({
                    filename: type_data['filename'][points_selected[i]],
                    label: type_data['label']
                })
            }
        }
        $('#images_box').empty()
        var folder = $('#select_folder').find(':selected').attr('value')
        for (var i = 0; i < data_selected.length; i++) {
            var div_img = document.createElement('div')
            div_img.setAttribute('class', 'card col-3 p-0')

            var img = document.createElement('img')
            img.setAttribute('src',  '/img_umap/' + folder + '/' + data_selected[i]['label'] + '/' + data_selected[i]['filename'] + "?" + make_rnd(8))
            img.setAttribute('class', 'w-100')
            img.setAttribute('id', 'img_umap')
            img.setAttribute('pic_name', data_selected[i]['filename'])
            img.setAttribute('label_type', data_selected[i]['label'])
            img.setAttribute('tooltip', data_selected[i]['filename'])

            var labelname = document.createElement('h5')
            labelname.innerHTML = data_selected[i]['label']
            labelname.setAttribute('class', 'bg-primary rounded text-white text-center w-50')
            labelname.setAttribute('style', 'position: relative; top: 80%; left: 3%')
            var filename = document.createElement('label')
            filename.setAttribute('class', 'text-secondary text-center')
            filename.innerHTML = data_selected[i]['filename']
            div_img.appendChild(labelname)
            div_img.appendChild(img)
            div_img.appendChild(filename)
                        
            $('#images_box').append(div_img)
        }
    })
    
    $(document).on('change', '.check_label_image', function(e) {
        var types = []
        var checks_types = document.querySelectorAll('.check_label_image')
        for (var i = 0; i < checks_types.length; i++) {
            if ($(checks_types[i]).prop('checked')) {
                types.push($(checks_types[i]).attr('value'))
            }
        }
        var folder = $('#select_folder').find(':selected').attr('value')
        $.ajax({
            type: "GET",
            url: '/get_images_file/' + folder,
            contentType: false,
            proccesData: false,
            success: (data) => {
                var pictures = data['pictures']
                $('#images_box').empty()
                for (var i = 0; i < pictures.length; i++) {
                    if (types.indexOf(pictures[i]['type']) != '-1') {
                        var div_img = document.createElement('div')
                        div_img.setAttribute('class', 'card col-3 p-0')

                        var img = document.createElement('img')
                        img.setAttribute('src',  '/img_umap/' + data['folder'] + '/' + pictures[i]['type'] + '/' + pictures[i]['name'] + "?" + make_rnd(8))
                        img.setAttribute('class', 'w-100')
                        img.setAttribute('id', 'img_umap')
                        img.setAttribute('pic_name', pictures[i]['name'])
                        img.setAttribute('label_type', pictures[i]['type'])
                        img.setAttribute('tooltip', pictures[i]['name'])

                        var labelname = document.createElement('h5')
                        labelname.innerHTML = pictures[i]['type']
                        labelname.setAttribute('class', 'bg-primary rounded text-white text-center w-50')
                        labelname.setAttribute('style', 'position: relative; top: 80%; left: 3%')

                        var filename = document.createElement('label')
                        filename.setAttribute('class', 'text-secondary text-center')
                        filename.innerHTML = pictures[i]['name']
                        div_img.appendChild(labelname)
                        div_img.appendChild(img)
                        div_img.appendChild(filename)
                        
                        $('#images_box').append(div_img)
                    }
                    
                }
            }
        })
    })
    $('#create_dataset').on('click', function() {
        $('#modal_create_dataset').modal('toggle')
        $.ajax({
            type: "GET",
            url: "/get_parameters_create_dataset",
            contentType: false,
            proccesData: false,
            success: (data) => {
                console.log(data)
                $('#select_dataset').empty()
                $('#type_img_dataset').empty()
                for (var i = 0; i < data['folders'].length; i++) {
                    var option = document.createElement('option')
                    option.setAttribute('value', data['folders'][i])
                    option.innerHTML = data['folders'][i]
                    $('#select_dataset').append(option)
                }
                var checks_types = document.querySelectorAll('.check_label_image')
                for (var i = 0; i < checks_types.length; i++) {
                    var option = document.createElement('option')
                    option.setAttribute('value', $(checks_types[i]).attr('value'))
                    option.innerHTML = $(checks_types[i]).attr('value')
                    $('#type_img_dataset').append(option)
                }
                
            }
        })
    })

    $('#new_dataset').on('click', function() {
        $('#form_parameters').attr('data_read_form', 'name_dataset')
        $('#new_dataset_form').show()
        $('#choise_dataset_form').hide()
    })
    $('#choise_dataset').on('click', function() {
        $('#form_parameters').attr('data_read_form', 'select_dataset')
        $('#new_dataset_form').hide()
        $('#choise_dataset_form').show()
    })

    $('#create_new_dataset').on('click', function() {
        var imgs = document.querySelectorAll("#img_umap")
        var folder = $('#select_folder').find(':selected').attr('value')
        var type_images = $('#type_img_dataset').find(':selected').attr('value')
        var name_dataset = ''
        if ($('#form_parameters').attr('data_read_form') == 'select_dataset') {
            name_dataset =  $('#select_dataset').find(':selected').attr('value')
        } else {
            name_dataset = $('#name_dataset').val()
        }
        var info = []
        for (var i = 0; i < imgs.length; i++) {
            info.push({
                label_type: $(imgs[i]).attr('label_type'),
                filename: $(imgs[i]).attr('pic_name')
            })
        }
        data = {
            images: info,
            folder: folder,
            type_images: type_images,
            name_dataset: name_dataset
        }
        $.ajax({
            type: "POST",
            url: "/create_dataset",
            contentType: false,
            proccesData: false,
            data: JSON.stringify(data),
            success: (data) => {
                if (data['status'] == "success") {
                    $('#success_create_dataset').slideDown(500)
                    $('#success_create_dataset').text(data['message'])
                    $('#success_create_dataset').delay(3000).slideUp()
                } else {
                    $('#error_create_dataset').slideDown(500)
                    $('#error_create_dataset').text(data['message'])
                    $('#error_create_dataset').delay(3000).slideUp()
                }
            }
        })
    })
})