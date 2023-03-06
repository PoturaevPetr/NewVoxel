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
                for (var i = 0; i < folders.length; i++) {
                    var option_folder = document.createElement('option')
                    option_folder.setAttribute('id', 'folder_' + i)
                    option_folder.setAttribute('value', folders[i])
                    option_folder.innerHTML = folders[i]
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
                for (var i = 0; i < pictures.length; i++) {
                    
                    var img = document.createElement('img')
                    img.setAttribute('src',  '/img_umap/' + data['folder'] + '/' + pictures[i]['type'] + '/' + pictures[i]['name'] + "?" + make_rnd(8))
                    img.setAttribute('class', 'w-25 p-1')
                    img.setAttribute('id', 'img_umap')
                    img.setAttribute('pic_name', pictures[i]['name'])
                    img.setAttribute('tooltip', pictures[i]['name'])
                    $('#images_box').append(img)
                }
                if (data['status'] == "success") {
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
                    }
                    for (var i = 0; i < data_umap.length; i++) {
                        data_plot[data_umap[i]['label']]['data_xs'].push(data_umap[i]['x'])
                        data_plot[data_umap[i]['label']]['data_ys'].push(data_umap[i]['y'])
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
                name: key_type[i],
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
    
})