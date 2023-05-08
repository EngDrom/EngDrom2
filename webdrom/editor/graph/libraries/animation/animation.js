

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

    let begin_animation = new MGraph_Function( "Animation Start", vector_space_EMPTY, vector_space_PATH );
    
    let atlas_texture_animation = new MGraph_Function(
        "Atlas Texture Animation", vector_space_PATH, vector_space_PATH
    ).add_parameter( new VecNParameter( "Object Index", [ "coordinates_index" ], 1 ) );

    let wait_animation = new MGraph_Function(
        "Wait", vector_space_PATH, vector_space_PATH
    ).add_parameter( new VecNParameter( "Duration", [ "duration" ], 1 ) )

    let multiplexer = new MGraph_Function(
        "Multiplexer", new MGraph_VariantVectorSpace(
            [ "Path A", "Path B" ],
            [ new MGraph_VectorSpace( [ path_type, path_type ] ) ]
        ), vector_space_PATH
    );

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
            atlas_texture_animation
        },
        library: new MGraph_Library(root_category, (mgraph) => {})
    }
})();

