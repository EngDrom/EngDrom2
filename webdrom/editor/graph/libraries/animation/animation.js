

const ANIMATION_CATEGORY = (function () {
    const PATH_COLOR = "#AAAAAA";

    let path_type = new MGraph_Type( "path", PATH_COLOR );

    let vector_space_EMPTY = new MGraph_VariantVectorSpace(
        [],
        [ new MGraph_VectorSpace([]) ]
    );
    let vector_space_PATH = new MGraph_VariantVectorSpace(
        [ "Path" ],
        [ new MGraph_VectorSpace([ path_type]) ]
    );

    function d_next (target, node, index = 0) {
        let output = node.outputs[index];
        for (let x of output.childs)
            return x.node;
    }

    let begin_animation = new MGraph_Function( "Animation Start", vector_space_EMPTY, vector_space_PATH )
    .modify("next", d_next);
    
    let atlas_texture_animation = new MGraph_Function(
        "Atlas Texture Animation", vector_space_PATH, vector_space_PATH
    ).add_parameter( new VecNParameter( "Object Index", [ "coordinates_index" ], 1 ) )
    .modify("action", (target, node) => target.target.setCoordinates( node.coordinates_index ))
    .modify("next", d_next);

    let wait_animation = new MGraph_Function(
        "Wait", vector_space_PATH, vector_space_PATH
    ).add_parameter( new VecNParameter( "Duration", [ "duration" ], 1 ) )
     .modify("start",  (target, node) => {
        target.date = + new Date()
     })
     .modify("can_do", (target, node) => {
        return (+ new Date()) - target.date > node.duration
    })
     .modify("next", d_next);

    let multiplexer = new MGraph_Function(
        "Multiplexer", new MGraph_VariantVectorSpace(
            [ "Path A", "Path B" ],
            [ new MGraph_VectorSpace( [ path_type, path_type ] ) ]
        ), vector_space_PATH
    )
    .modify("next", d_next);

    let check_dx = new MGraph_Function(
        "Horizontal Speed", vector_space_PATH, new MGraph_VariantVectorSpace(
            [ "dx = 0", "dx != 0" ],
            [ new MGraph_VectorSpace( [ path_type, path_type ] ) ]
        )
    ).modify("next", (target, node) => {
        let dx = target.target.sri.position.spe.x + target.target.sri.position.ssp.x;

        return d_next(target, node, dx == 0 ? 0 : 1);
    })

    let root_category = new MGraph_Category( "root", 
        [], 
        [ begin_animation, atlas_texture_animation, wait_animation, multiplexer, check_dx ]
    );

    return {
        types: {
            path: path_type
        },
        functions: {
            begin_animation,
            atlas_texture_animation,
            wait_animation,
            multiplexer
        },
        library: new MGraph_Library(root_category, (mgraph) => {
            let animations = ANIMATIONS_ARRAY[mgraph.file_path]
            if (animations === undefined) return ;

            for (let animation of animations)
                animation.update(mgraph.nodes)
        })
    }
})();

