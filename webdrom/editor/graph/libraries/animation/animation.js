

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

    function d_next (target, node) {
        let output = node.outputs[0];
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

    let root_category = new MGraph_Category( "root", 
        [], 
        [ begin_animation, atlas_texture_animation, wait_animation, multiplexer ]
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
        library: new MGraph_Library(root_category, (mgraph) => {})
    }
})();

